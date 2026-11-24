const prisma = require('../../config/prisma');

const toDateKey = (d) => d.toISOString().slice(0, 10);

const getDashboard = async () => {
  const [ordersAgg, ordersCount, customersCount, productsCount, activeProducts, lowStock, pendingOrders, recentOrders, statusGroups, products] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalCents: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count(),
    prisma.product.count({ where: { stock: { gt: 0 } } }),
    prisma.product.findMany({ where: { stock: { lte: 5 } }, orderBy: [{ stock: 'asc' }, { name: 'asc' }], take: 8, select: { id: true, name: true, slug: true, stock: true, priceCents: true } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, orderCode: true, customerName: true, totalCents: true, status: true, paymentStatus: true, createdAt: true } }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true }, _sum: { totalCents: true } }),
    prisma.product.findMany({ select: { id: true, name: true, orderItems: { select: { quantity: true, unitPriceCents: true } } } }),
  ]);

  const totalRevenueCents = ordersAgg._sum.totalCents || 0;
  const averageTicketCents = ordersCount ? Math.round(totalRevenueCents / ordersCount) : 0;

  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);
  const recent = await prisma.order.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, totalCents: true } });
  const byDay = new Map();
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(since); d.setDate(since.getDate() + i);
    byDay.set(toDateKey(d), { date: toDateKey(d), orders: 0, revenueCents: 0 });
  }
  for (const o of recent) {
    const k = toDateKey(o.createdAt);
    if (byDay.has(k)) {
      const entry = byDay.get(k);
      entry.orders += 1;
      entry.revenueCents += o.totalCents;
    }
  }

  const topProducts = products.map((p) => {
    const qty = p.orderItems.reduce((s, i) => s + i.quantity, 0);
    const revenueCents = p.orderItems.reduce((s, i) => s + i.quantity * i.unitPriceCents, 0);
    return { id: p.id, name: p.name, quantity: qty, revenueCents };
  }).filter((p) => p.quantity > 0).sort((a, b) => b.revenueCents - a.revenueCents).slice(0, 5);

  return {
    kpis: { totalRevenueCents, ordersCount, averageTicketCents, customersCount, productsCount, activeProducts, lowStockCount: lowStock.length, pendingOrders },
    salesByDay: Array.from(byDay.values()),
    ordersByStatus: statusGroups.map((g) => ({ status: g.status, count: g._count._all, revenueCents: g._sum.totalCents || 0 })),
    topProducts,
    lowStock,
    recentOrders,
  };
};

module.exports = { getDashboard };
