const prisma = require('../config/prisma');
const { HttpError } = require('../utils/http-error');

const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  brand: true,
  priceCents: true,
  compareAtCents: true,
  stock: true,
  imageUrl: true,
  featured: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
};

const productDetailSelect = {
  ...productSelect,
  images: { select: { id: true, url: true, alt: true, sortOrder: true }, orderBy: { sortOrder: 'asc' } },
  specifications: { select: { id: true, label: true, value: true, sortOrder: true }, orderBy: { sortOrder: 'asc' } },
};

const SORT_MAP = {
  newest: { createdAt: 'desc' },
  'price-asc': { priceCents: 'asc' },
  'price-desc': { priceCents: 'desc' },
  name: { name: 'asc' },
};

const readPositiveInt = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const parsePrice = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const normalized = String(value).replace(',', '.').trim();
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
};

const buildSearchWhere = (search) => {
  const terms = String(search || '').trim().split(/\s+/).filter(Boolean).slice(0, 6);
  if (!terms.length) return null;
  return {
    AND: terms.map((term) => ({
      OR: [
        { name: { contains: term } },
        { description: { contains: term } },
        { brand: { contains: term } },
        { category: { name: { contains: term } } },
        { category: { slug: { contains: term } } },
        { specifications: { some: { label: { contains: term } } } },
        { specifications: { some: { value: { contains: term } } } },
      ],
    })),
  };
};

const listProducts = async (req, res) => {
  const page = readPositiveInt(req.query.page, 1, 100000);
  const pageSize = readPositiveInt(req.query.pageSize, 12, 48);
  const sort = SORT_MAP[req.query.sort] ? req.query.sort : 'newest';
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  const search = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const brand = typeof req.query.brand === 'string' ? req.query.brand.trim() : '';
  const availability = typeof req.query.availability === 'string' ? req.query.availability.trim() : '';
  const featured = req.query.featured === 'true';
  const offer = req.query.offer === 'true';
  const minPriceCents = parsePrice(req.query.minPrice);
  const maxPriceCents = parsePrice(req.query.maxPrice);

  const and = [{ archived: false }];
  if (category) and.push({ category: { slug: category } });
  if (featured) and.push({ featured: true });
  if (brand) and.push({ brand });
  if (availability === 'in-stock') and.push({ stock: { gt: 0 } });
  if (availability === 'out-of-stock') and.push({ stock: { lte: 0 } });
  if (offer) and.push({ compareAtCents: { not: null } });
  if (minPriceCents !== null) and.push({ priceCents: { gte: minPriceCents } });
  if (maxPriceCents !== null) and.push({ priceCents: { lte: maxPriceCents } });
  const searchWhere = buildSearchWhere(search);
  if (searchWhere) and.push(searchWhere);
  const where = { AND: and };

  let items = await prisma.product.findMany({
    where,
    select: productSelect,
    orderBy: SORT_MAP[sort],
  });

  if (offer) {
    items = items.filter((item) => item.compareAtCents && item.compareAtCents > item.priceCents);
  }

  const total = items.length;
  const paged = items.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

  res.json({
    data: paged,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      filters: { category, search, brand, availability, sort, featured, offer, minPriceCents, maxPriceCents },
    },
  });
};

const getProductBySlug = async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, archived: false },
      select: productDetailSelect,
    });
    if (!product) throw new HttpError(404, 'Produto não encontrado.');
    res.json({ data: product });
  } catch (error) {
    next(error);
  }
};

const listBrands = async (_req, res) => {
  const rows = await prisma.product.findMany({
    where: { archived: false, brand: { not: null } },
    select: { brand: true },
    distinct: ['brand'],
    orderBy: { brand: 'asc' },
  });
  res.json({ data: rows.map((row) => row.brand).filter(Boolean) });
};

const listSuggestions = async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const limit = readPositiveInt(req.query.limit, 6, 10);
  if (q.length < 2) return res.json({ data: [] });
  const searchWhere = buildSearchWhere(q);
  const items = await prisma.product.findMany({
    where: { AND: [{ archived: false }, searchWhere] },
    select: { id: true, name: true, slug: true, brand: true, imageUrl: true, priceCents: true, stock: true, category: { select: { name: true, slug: true } } },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });
  res.json({ data: items });
};

module.exports = { listProducts, getProductBySlug, listBrands, listSuggestions };
