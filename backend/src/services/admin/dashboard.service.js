const fs = require('node:fs');
const path = require('node:path');
const prisma = require('../../config/prisma');
const { listActivities } = require('./activity.service');

const UPLOAD_DIR = path.resolve(__dirname, '../../../../uploads/products');

const toDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const toMonthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const rangeConfig = (range) => {
  if (range === '30d') return { days: 30, bucket: 'day' };
  if (range === '90d') return { days: 90, bucket: 'day' };
  if (range === '12m') return { months: 12, bucket: 'month' };
  return { days: 7, bucket: 'day' };
};

const getDashboard = async (query = {}) => {
  const registrationRange = ['7d', '30d', '90d', '12m'].includes(query.registrationRange) ? query.registrationRange : '30d';
  const cfg = rangeConfig(registrationRange);
  const now = new Date();
  const since = new Date(now);
  if (cfg.bucket === 'month') { since.setMonth(since.getMonth() - (cfg.months - 1)); since.setDate(1); since.setHours(0,0,0,0); }
  else { since.setDate(since.getDate() - (cfg.days - 1)); since.setHours(0,0,0,0); }

  const activeWhere = { archived: false };
  const [ordersAgg, ordersCount, customersCount, productsCount, activeProducts, lowStockRows, lowStockCount, noImageCount, noDescriptionCount, featuredCount, totalCategories, totalImages, pendingOrders, recentOrders, statusGroups, products, categories, featuredProducts, recentProducts, registrationProducts, recentActivities] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalCents: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.product.count({ where: activeWhere }),
    prisma.product.count({ where: { ...activeWhere, stock: { gt: 0 } } }),
    prisma.product.findMany({ where: { ...activeWhere, stock: { lte: 5 } }, orderBy: [{ stock: 'asc' }, { name: 'asc' }], take: 8, select: { id: true, name: true, slug: true, stock: true, priceCents: true } }),
    prisma.product.count({ where: { ...activeWhere, stock: { lte: 5 } } }),
    prisma.product.count({ where: { ...activeWhere, imageUrl: null, images: { none: {} } } }),
    prisma.product.count({ where: { ...activeWhere, OR: [{ description: '' }] } }),
    prisma.product.count({ where: { ...activeWhere, featured: true } }),
    prisma.category.count(),
    prisma.productImage.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, orderCode: true, customerName: true, totalCents: true, status: true, paymentStatus: true, createdAt: true } }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true }, _sum: { totalCents: true } }),
    prisma.product.findMany({ where: activeWhere, select: { id: true, name: true, orderItems: { select: { quantity: true, unitPriceCents: true } } } }),
    prisma.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { products: { where: activeWhere } } } } }),
    prisma.product.findMany({ where: { ...activeWhere, featured: true }, orderBy: [{ updatedAt: 'desc' }], take: 8, select: { id: true, name: true, slug: true, imageUrl: true, category: { select: { name: true, slug: true } } } }),
    prisma.product.findMany({ where: activeWhere, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, slug: true, createdAt: true, category: { select: { name: true } } } }),
    prisma.product.findMany({ where: { ...activeWhere, createdAt: { gte: since } }, select: { createdAt: true } }),
    listActivities(12).catch(() => []),
  ]);

  const totalRevenueCents = ordersAgg._sum.totalCents || 0;
  const averageTicketCents = ordersCount ? Math.round(totalRevenueCents / ordersCount) : 0;

  const salesSince = new Date(now); salesSince.setDate(salesSince.getDate() - 6); salesSince.setHours(0,0,0,0);
  const recentSales = await prisma.order.findMany({ where: { createdAt: { gte: salesSince } }, select: { createdAt: true, totalCents: true } });
  const byDay = new Map();
  for (let i = 0; i < 7; i += 1) { const d = new Date(salesSince); d.setDate(salesSince.getDate() + i); byDay.set(toDateKey(d), { date: toDateKey(d), orders: 0, revenueCents: 0 }); }
  for (const o of recentSales) { const k = toDateKey(o.createdAt); if (byDay.has(k)) { const e = byDay.get(k); e.orders += 1; e.revenueCents += o.totalCents; } }

  const regBuckets = new Map();
  if (cfg.bucket === 'month') {
    for (let i = 0; i < cfg.months; i += 1) { const d = new Date(since.getFullYear(), since.getMonth() + i, 1); regBuckets.set(toMonthKey(d), { label: toMonthKey(d), count: 0 }); }
  } else {
    for (let i = 0; i < cfg.days; i += 1) { const d = new Date(since); d.setDate(since.getDate() + i); regBuckets.set(toDateKey(d), { label: toDateKey(d), count: 0 }); }
  }
  for (const p of registrationProducts) { const k = cfg.bucket === 'month' ? toMonthKey(p.createdAt) : toDateKey(p.createdAt); if (regBuckets.has(k)) regBuckets.get(k).count += 1; }
  const productRegistration = Array.from(regBuckets.values());
  const registrationTotal = productRegistration.reduce((s, b) => s + b.count, 0);

  const categoryDistribution = categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, count: c._count.products }));
  const catTotal = categoryDistribution.reduce((s, c) => s + c.count, 0) || 1;
  for (const c of categoryDistribution) c.percent = Number(((c.count / catTotal) * 100).toFixed(1));
  const departmentComparison = [...categoryDistribution].sort((a, b) => b.count - a.count);

  let orphanFilesCount = 0;
  let missingImageFiles = 0;
  try {
    const files = fs.readdirSync(UPLOAD_DIR).filter((f) => !f.startsWith('.'));
    const fileSet = new Set(files);
    const dbImages = await prisma.productImage.findMany({ select: { url: true } });
    const referenced = new Set(dbImages.map((i) => path.basename(i.url || '')));
    orphanFilesCount = files.filter((f) => !referenced.has(f)).length;
    missingImageFiles = dbImages.filter((i) => { const b = path.basename(i.url || ''); return b && !fileSet.has(b); }).length;
  } catch { orphanFilesCount = 0; missingImageFiles = 0; }

  const topProducts = products.map((p) => {
    const quantity = p.orderItems.reduce((s, i) => s + i.quantity, 0);
    const revenueCents = p.orderItems.reduce((s, i) => s + i.quantity * i.unitPriceCents, 0);
    return { id: p.id, name: p.name, quantity, revenueCents };
  }).filter((p) => p.quantity > 0).sort((a, b) => b.revenueCents - a.revenueCents).slice(0, 5);

  const dbOk = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);

  return {
    kpis: { totalRevenueCents, ordersCount, averageTicketCents, customersCount, productsCount, activeProducts, lowStockCount, noImageCount, noDescriptionCount, featuredCount, pendingOrders, totalCategories, totalImages, recentlyAdded7d: await prisma.product.count({ where: { ...activeWhere, createdAt: { gte: new Date(Date.now() - 7*86400000) } } }) },
    salesByDay: Array.from(byDay.values()),
    productRegistration: { range: registrationRange, bucket: cfg.bucket, from: since.toISOString(), to: now.toISOString(), totalInRange: registrationTotal, hasEnoughHistory: registrationTotal > 0 && new Set(productRegistration.filter(b=>b.count>0).map(b=>b.label)).size > 1, buckets: productRegistration },
    categoryDistribution,
    departmentComparison,
    mediaHealth: { withImage: Math.max(0, productsCount - noImageCount), withoutImage: noImageCount, orphanFiles: orphanFilesCount, invalidImageRefs: missingImageFiles, totalImages },
    featuredProducts,
    ordersByStatus: statusGroups.map((g) => ({ status: g.status, count: g._count._all, revenueCents: g._sum.totalCents || 0 })),
    topProducts,
    lowStock: lowStockRows,
    recentOrders,
    recentProducts,
    recentActivities,
    systemHealth: { api: 'ok', database: dbOk ? 'ok' : 'error', productsLoaded: productsCount, media: { totalImages, orphanFiles: orphanFilesCount, missingImageFiles }, recentErrors: recentActivities.filter(a => a.action === 'ERROR').length, recentErrorsCollected: recentActivities.some(a => a.action === 'ERROR') },
  };
};

module.exports = { getDashboard };
