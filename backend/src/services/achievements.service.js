const prisma = require('../config/prisma');

const ACHIEVEMENTS = [
  { code: 'FIRST_CONNECTION', title: 'Primeira conex?o', description: 'Conta WIRED ID criada.' },
  { code: 'FIRST_ORDER', title: 'Primeiro pedido', description: 'Primeiro pedido concluído no sistema.' },
  { code: 'COLLECTOR', title: 'Colecionador', description: '5 produtos salvos na wishlist.' },
  { code: 'EXPLORER', title: 'Explorador', description: 'Explorou 3 categorias diferentes.' },
  { code: 'ROOT_MEMBER', title: 'Membro ROOT', description: 'Assinatura ROOT ACCESS ativa.' },
];

const unlock = async (userId, achievementCode, metadata = null) => {
  try {
    await prisma.userAchievement.create({
      data: { userId, achievementCode, metadata: metadata ? JSON.stringify(metadata) : null },
    });
  } catch (error) {
    if (error?.code !== 'P2002') throw error;
  }
};

const getUserAchievements = async (userId) => {
  const rows = await prisma.userAchievement.findMany({ where: { userId }, orderBy: { unlockedAt: 'asc' } });
  const unlocked = new Map(rows.map((r) => [r.achievementCode, r]));
  return ACHIEVEMENTS.map((def) => {
    const row = unlocked.get(def.code);
    return { ...def, unlocked: Boolean(row), unlockedAt: row?.unlockedAt || null };
  });
};

const checkCollector = async (userId) => {
  const count = await prisma.wishlistItem.count({ where: { userId } });
  if (count >= 5) await unlock(userId, 'COLLECTOR', { count });
};

const checkExplorer = async (userId) => {
  const rows = await prisma.recentlyViewedItem.findMany({
    where: { userId },
    select: { product: { select: { categoryId: true } } },
  });
  const categories = new Set(rows.map((r) => r.product?.categoryId).filter(Boolean));
  if (categories.size >= 3) await unlock(userId, 'EXPLORER', { categories: categories.size });
};

const checkFirstOrder = async (userId) => {
  const count = await prisma.order.count({ where: { userId } });
  if (count >= 1) await unlock(userId, 'FIRST_ORDER', { count });
};

module.exports = { ACHIEVEMENTS, unlock, getUserAchievements, checkCollector, checkExplorer, checkFirstOrder };
