const prisma = require('../../config/prisma');
const { HttpError } = require('../../utils/http-error');

const listCustomers = async (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
  const q = typeof query.q === 'string' ?query.q.trim() : '';
  const where = { role: 'CUSTOMER' };
  if (q) where.OR = [{ name: { contains: q } }, { email: { contains: q.toLowerCase() } }];
  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize, select: { id: true, name: true, email: true, phone: true, active: true, createdAt: true, _count: { select: { orders: true, addresses: true } } } }),
  ]);
  return { items, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
};

const getCustomer = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phone: true, role: true, active: true, createdAt: true, addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] }, orders: { orderBy: { createdAt: 'desc' }, include: { items: true } } },
  });
  if (!user || user.role !== 'CUSTOMER') throw new HttpError(404, 'Cliente não encontrado.');
  return user;
};

const updateCustomerStatus = async (id, active) => {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!user || user.role !== 'CUSTOMER') throw new HttpError(404, 'Cliente não encontrado.');
  return prisma.user.update({ where: { id }, data: { active }, select: { id: true, name: true, email: true, phone: true, active: true, createdAt: true } });
};

module.exports = { listCustomers, getCustomer, updateCustomerStatus };


