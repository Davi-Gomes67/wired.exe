const prisma = require('../config/prisma');
const { HttpError } = require('../utils/http-error');
const { generateOrderCode } = require('../utils/order-code');
const { checkFirstOrder } = require('./achievements.service');

const buildSnapshot = (items, productById) => {
  for (const item of items) {
    if (!productById.has(item.productId)) throw new HttpError(404, `Produto ${item.productId} não encontrado.`);
  }
  return items.map((item) => {
    const product = productById.get(item.productId);
    const valid = product.stock >= item.quantity;
    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      stock: product.stock,
      requestedQty: item.quantity,
      unitPriceCents: product.priceCents,
      lineTotalCents: product.priceCents * item.quantity,
      valid,
      issue: valid ? null : 'INSUFFICIENT_STOCK',
    };
  });
};

const validateCart = async ({ items }) => {
  const ids = items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, slug: true, imageUrl: true, stock: true, priceCents: true },
  });
  const productById = new Map(products.map((product) => [product.id, product]));
  const lines = buildSnapshot(items, productById);
  const subtotalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  return { valid: lines.every((line) => line.valid), subtotalCents, totalCents: subtotalCents, items: lines };
};

const createOrder = async (payload, user) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderCode = generateOrderCode();
    try {
      const order = await prisma.$transaction(async (tx) => {
        const ids = payload.items.map((item) => item.productId);
        const products = await tx.product.findMany({ where: { id: { in: ids } } });
        const productById = new Map(products.map((product) => [product.id, product]));

        const missing = payload.items.find((item) => !productById.has(item.productId));
        if (missing) throw new HttpError(404, `Produto ${missing.productId} não encontrado.`);

        const snapshots = payload.items.map((item) => {
          const product = productById.get(item.productId);
          if (product.stock < item.quantity) {
            throw new HttpError(409, `Estoque insuficiente para "${product.name}".`, { productId: product.id, stock: product.stock });
          }
          return { productId: product.id, nameSnapshot: product.name, unitPriceCents: product.priceCents, quantity: item.quantity };
        });

        for (const item of payload.items) {
          const updated = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (updated.count !== 1) throw new HttpError(409, 'Estoque alterado durante a compra. Tente novamente.');
        }

        const subtotalCents = snapshots.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0);

        const created = await tx.order.create({
          data: {
            orderCode,
            userId: user.id,
            customerName: user.name,
            customerEmail: user.email,
            customerPhone: payload.customerPhone || user.phone || null,
            addressLine1: payload.addressLine1,
            addressLine2: payload.addressLine2,
            district: payload.district,
            city: payload.city,
            state: payload.state,
            postalCode: payload.postalCode,
            paymentMethod: payload.paymentMethod,
            paymentStatus: payload.paymentStatus,
            status: 'PENDING',
            subtotalCents,
            totalCents: subtotalCents,
            items: { create: snapshots },
          },
          include: { items: true },
        });
        return created;
      });
      await checkFirstOrder(user.id).catch(() => {});
      return order;
    } catch (error) {
      if (error && error.code === 'P2002' && attempt < 4) continue;
      throw error;
    }
  }
  throw new HttpError(500, 'Não foi possível gerar o identificador do pedido.');
};

const findOrderByCode = async (code, userId) => {
  const normalized = String(code || '').trim().toUpperCase();
  const order = await prisma.order.findFirst({
    where: { orderCode: normalized, userId },
    include: { items: true },
  });
  if (!order) throw new HttpError(404, 'Pedido não encontrado.');
  return order;
};

const listOrdersByUser = async (userId) =>
  prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

module.exports = { validateCart, createOrder, findOrderByCode, listOrdersByUser };
