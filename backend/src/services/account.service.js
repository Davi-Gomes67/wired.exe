const prisma = require('../config/prisma');
const { HttpError } = require('../utils/http-error');
const { sanitizeUser, SAFE_USER_SELECT } = require('./auth.service');
const { getUserAchievements, checkCollector, checkExplorer } = require('./achievements.service');

const PRODUCT_SELECT = {
  id: true, name: true, slug: true, imageUrl: true, brand: true, priceCents: true, stock: true,
  category: { select: { name: true, slug: true } },
};

const getMyRootAccess = async (userId) => prisma.rootAccessSubscription.findFirst({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  select: { id: true, status: true, planCode: true, priceCents: true, acceptedTermsAt: true, source: true, orderCode: true, cancelledAt: true, expiresAt: true, createdAt: true, updatedAt: true },
});

const getWishlist = async (userId) => {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId }, orderBy: { createdAt: 'desc' }, select: { createdAt: true, product: { select: PRODUCT_SELECT } },
  });
  return rows.map((r) => ({ ...r.product, savedAt: r.createdAt }));
};

const syncWishlist = async (userId, productIds = []) => {
  const ids = Array.isArray(productIds) ?[...new Set(productIds.map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, 100) : [];
  if (ids.length) {
    const existing = await prisma.product.findMany({ where: { id: { in: ids }, archived: false }, select: { id: true } });
    for (const p of existing) {
      try { await prisma.wishlistItem.create({ data: { userId, productId: p.id } }); } catch (e) { if (e?.code !== 'P2002') throw e; }
    }
  }
  await checkCollector(userId);
  return getWishlist(userId);
};

const addWishlistItem = async (userId, productId) => {
  const product = await prisma.product.findFirst({ where: { id: Number(productId), archived: false }, select: { id: true } });
  if (!product) throw new HttpError(404, 'Produto não encontrado.');
  try { await prisma.wishlistItem.create({ data: { userId, productId: product.id } }); } catch (e) { if (e?.code !== 'P2002') throw e; }
  await checkCollector(userId);
  return getWishlist(userId);
};

const removeWishlistItem = async (userId, productId) => {
  await prisma.wishlistItem.deleteMany({ where: { userId, productId: Number(productId) } });
  return getWishlist(userId);
};

const getRecentlyViewed = async (userId) => {
  const rows = await prisma.recentlyViewedItem.findMany({
    where: { userId }, orderBy: { viewedAt: 'desc' }, take: 12,
    select: { viewedAt: true, product: { select: PRODUCT_SELECT } },
  });
  return rows.map((r) => ({ ...r.product, viewedAt: r.viewedAt }));
};

const addRecentlyViewed = async (userId, productId) => {
  const product = await prisma.product.findFirst({ where: { id: Number(productId), archived: false }, select: { id: true } });
  if (!product) return getRecentlyViewed(userId);
  await prisma.recentlyViewedItem.upsert({
    where: { userId_productId: { userId, productId: product.id } },
    create: { userId, productId: product.id, viewedAt: new Date() },
    update: { viewedAt: new Date() },
  });
  const old = await prisma.recentlyViewedItem.findMany({ where: { userId }, orderBy: { viewedAt: 'desc' }, skip: 12, select: { id: true } });
  if (old.length) await prisma.recentlyViewedItem.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
  await checkExplorer(userId);
  return getRecentlyViewed(userId);
};

const removeRecentlyViewed = async (userId, productId) => {
  await prisma.recentlyViewedItem.deleteMany({ where: { userId, productId: Number(productId) } });
  return getRecentlyViewed(userId);
};

const getOverview = async (userId) => {
  const userRaw = await prisma.user.findUnique({ where: { id: userId }, select: SAFE_USER_SELECT });
  const [orders, wishlist, recentlyViewed, rootAccess, achievements] = await Promise.all([
    prisma.order.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, orderCode: true, status: true, paymentStatus: true, totalCents: true, createdAt: true, items: { select: { quantity: true } } } }),
    prisma.wishlistItem.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 4, select: { createdAt: true, product: { select: PRODUCT_SELECT } } }),
    prisma.recentlyViewedItem.findMany({ where: { userId }, orderBy: { viewedAt: 'desc' }, take: 4, select: { viewedAt: true, product: { select: PRODUCT_SELECT } } }),
    getMyRootAccess(userId),
    getUserAchievements(userId),
  ]);
  return {
    user: sanitizeUser(userRaw),
    rootAccess,
    orders: orders.map((o) => ({ ...o, itemCount: o.items.reduce((s, i) => s + i.quantity, 0) })),
    wishlist: wishlist.map((r) => ({ ...r.product, savedAt: r.createdAt })),
    recentlyViewed: recentlyViewed.map((r) => ({ ...r.product, viewedAt: r.viewedAt })),
    achievements,
  };
};

module.exports = { getOverview, getMyRootAccess, getWishlist, syncWishlist, addWishlistItem, removeWishlistItem, getRecentlyViewed, addRecentlyViewed, removeRecentlyViewed };
