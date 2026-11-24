const prisma = require('../config/prisma');
const { HttpError } = require('../utils/http-error');

const ADDRESS_SELECT = {
  id: true, label: true, recipientName: true, phone: true, postalCode: true,
  addressLine1: true, addressLine2: true, district: true, city: true, state: true,
  isDefault: true, createdAt: true, updatedAt: true,
};

const listAddresses = (userId) =>
  prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }], select: ADDRESS_SELECT });

const createAddress = async (userId, payload) => {
  return prisma.$transaction(async (tx) => {
    const count = await tx.address.count({ where: { userId } });
    const shouldDefault = payload.isDefault === true || count === 0;
    if (shouldDefault) await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    return tx.address.create({ data: { ...payload, userId, isDefault: shouldDefault }, select: ADDRESS_SELECT });
  });
};

const updateAddress = async (userId, addressId, payload) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.address.findFirst({ where: { id: addressId, userId }, select: { id: true } });
    if (!existing) throw new HttpError(404, 'Endereço não encontrado.');
    if (payload.isDefault === true) {
      await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    return tx.address.update({ where: { id: addressId }, data: payload, select: ADDRESS_SELECT });
  });
};

const deleteAddress = async (userId, addressId) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.address.findFirst({ where: { id: addressId, userId }, select: { id: true, isDefault: true } });
    if (!existing) throw new HttpError(404, 'Endereço não encontrado.');
    await tx.address.delete({ where: { id: addressId } });
    if (existing.isDefault) {
      const next = await tx.address.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { id: true } });
      if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  });
};

module.exports = { listAddresses, createAddress, updateAddress, deleteAddress };
