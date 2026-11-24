const prisma = require('../../config/prisma');
const { HttpError } = require('../../utils/http-error');

const listOrders = async (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
  const where = {};
  if (query.status) where.status = String(query.status).toUpperCase();
  if (query.paymentStatus) where.paymentStatus = String(query.paymentStatus).toUpperCase();
  if (query.q) where.OR = [{ orderCode: { contains: String(query.q).trim().toUpperCase() } }, { customerEmail: { contains: String(query.q).trim().toLowerCase() } }, { customerName: { contains: String(query.q).trim() } }];
  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({ where, include: { items: true, user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  return { items, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
};

const getOrder = async (id) => {
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true, user: { select: { id: true, name: true, email: true } } } });
  if (!order) throw new HttpError(404, 'Pedido nÃ£o encontrado.');
  return order;
};

const updateOrderStatus = async (id, data) => {
  await getOrder(id);
  return prisma.order.update({ where: { id }, data, include: { items: true, user: { select: { id: true, name: true, email: true } } } });
};

module.exports = { listOrders, getOrder, updateOrderStatus };

