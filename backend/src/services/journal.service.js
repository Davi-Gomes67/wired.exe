const prisma = require('../config/prisma');
const { HttpError } = require('../utils/http-error');

const JOURNAL_CATEGORIES = ['HARDWARE', 'SOFTWARE', 'RETRO_COMPUTING', 'DIGITAL_CULTURE', 'DIY_PROJECTS', 'GEEK_CULTURE'];

const articleSelect = {
  id: true, slug: true, title: true, subtitle: true, excerpt: true, category: true, authorName: true,
  coverImageUrl: true, featured: true, publishedAt: true, readingTimeMinutes: true, createdAt: true, updatedAt: true,
};

const parseContent = (raw) => {
  try { const parsed = JSON.parse(raw || '[]'); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
};

const toPublicArticle = (a, includeContent = false) => ({
  ...a,
  content: includeContent ? parseContent(a.content) : undefined,
  relatedProducts: a.relatedProducts?.map((rp) => rp.product).filter(Boolean) || undefined,
});

const listPublished = async (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(24, Math.max(1, Number(query.pageSize) || 12));
  const category = typeof query.category === 'string' ?query.category.toUpperCase().replace(/[\s-]+/g, '_') : '';
  const q = typeof query.q === 'string' ?query.q.trim() : '';
  const where = { status: 'PUBLISHED', publishedAt: { lte: new Date() } };
  if (JOURNAL_CATEGORIES.includes(category)) where.category = category;
  if (q) where.OR = [{ title: { contains: q } }, { excerpt: { contains: q } }, { subtitle: { contains: q } }, { authorName: { contains: q } }];
  const [total, items, featured] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({ where, select: articleSelect, orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }], skip: (page - 1) * pageSize, take: pageSize }),
    prisma.article.findFirst({ where: { ...where, featured: true }, select: articleSelect, orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }] }),
  ]);
  return { items, featured, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
};

const listCategories = async () => {
  const counts = await prisma.article.groupBy({
    by: ['category'],
    where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
    _count: { _all: true },
  });
  const map = new Map(counts.map((c) => [c.category, c._count._all]));
  return JOURNAL_CATEGORIES.map((category) => ({ category, count: map.get(category) || 0 }));
};

const getPublishedBySlug = async (slug) => {
  const article = await prisma.article.findFirst({
    where: { slug, status: 'PUBLISHED', publishedAt: { lte: new Date() } },
    include: {
      relatedProducts: {
        orderBy: { sortOrder: 'asc' },
        include: { product: { select: { id: true, name: true, slug: true, imageUrl: true, priceCents: true, stock: true, category: { select: { name: true, slug: true } } } } },
      },
    },
  });
  if (!article) throw new HttpError(404, 'Artigo não encontrado.');
  const relatedArticles = await prisma.article.findMany({
    where: { status: 'PUBLISHED', publishedAt: { lte: new Date() }, id: { not: article.id }, category: article.category },
    select: articleSelect,
    orderBy: [{ publishedAt: 'desc' }],
    take: 3,
  });
  return { ...toPublicArticle(article, true), relatedArticles };
};

const getRecent = async (limit = 3) => {
  const take = Math.min(8, Math.max(1, Number(limit) || 3));
  return prisma.article.findMany({
    where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
    select: articleSelect,
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    take,
  });
};

const getRelated = async ({ productId, category, limit = 3 } = {}) => {
  const take = Math.min(6, Math.max(1, Number(limit) || 3));
  const now = new Date();
  const where = { status: 'PUBLISHED', publishedAt: { lte: now } };
  const pid = Number(productId);
  const cat = typeof category === 'string' ?category.toUpperCase().replace(/[\s-]+/g, '_') : '';
  if (Number.isInteger(pid) && pid > 0) {
    where.OR = [{ relatedProducts: { some: { productId: pid } } }, ...(JOURNAL_CATEGORIES.includes(cat) ?[{ category: cat }] : [])];
  } else if (JOURNAL_CATEGORIES.includes(cat)) {
    where.category = cat;
  } else {
    return [];
  }
  return prisma.article.findMany({ where, select: articleSelect, orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }], take });
};

module.exports = { JOURNAL_CATEGORIES, listPublished, listCategories, getPublishedBySlug, getRecent, getRelated, parseContent };