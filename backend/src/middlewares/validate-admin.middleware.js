const prisma = require('../config/prisma');
const { HttpError } = require('../utils/http-error');

const ORDER_STATUSES = new Set(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
const PAYMENT_STATUSES = new Set(['NOT_PROCESSED', 'PAID', 'REFUNDED', 'FAILED']);
const ROLES = new Set(['CUSTOMER', 'ADMIN']);

const readInt = (value, field) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, `${field} inválido.`);
  return n;
};

const readString = (value, field, min, max, optional = false) => {
  if ((value === undefined || value === null || value === '') && optional) return null;
  if (typeof value !== 'string') throw new HttpError(400, `O campo ${field} deve ser texto.`);
  const t = value.trim();
  if (!t && optional) return null;
  if (t.length < min || t.length > max) throw new HttpError(400, `O campo ${field} deve ter entre ${min} e ${max} caracteres.`);
  return t;
};

const readSlug = (value, field = 'slug') => {
  const slug = readString(value, field, 2, 140).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) throw new HttpError(400, 'Slug inválido.');
  return slug;
};

const readBool = (value, field, fallback = undefined) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new HttpError(400, `O campo ${field} deve ser booleano.`);
};

const readMoneyCents = (value, field, optional = false) => {
  if ((value === undefined || value === null || value === '') && optional) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) throw new HttpError(400, `O campo ${field} deve ser inteiro >= 0.`);
  return n;
};

const readStock = (value, field = 'stock') => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 999999) throw new HttpError(400, 'Estoque inválido.');
  return n;
};

const validateCategoryBody = (req, _res, next) => {
  try {
    const b = req.body || {};
    const name = readString(b.name, 'name', 2, 100);
    req.validatedCategory = {
      name,
      slug: b.slug ? readSlug(b.slug) : readSlug(name),
      description: readString(b.description, 'description', 0, 500, true),
    };
    next();
  } catch (e) { next(e); }
};

const validateProductBody = (partial = false) => (req, _res, next) => {
  try {
    const b = req.body || {};
    const has = (k) => b[k] !== undefined;
    const data = {};
    if (!partial || has('name')) data.name = readString(b.name, 'name', 2, 160);
    if (!partial || has('slug')) data.slug = b.slug ? readSlug(b.slug) : (data.name ? readSlug(data.name) : undefined);
    if (!partial || has('description')) data.description = readString(b.description, 'description', 10, 5000);
    if (!partial || has('brand')) data.brand = readString(b.brand, 'brand', 0, 80, true);
    if (!partial || has('categoryId')) data.categoryId = readInt(b.categoryId, 'categoryId');
    if (!partial || has('priceCents')) data.priceCents = readMoneyCents(b.priceCents, 'priceCents');
    if (has('compareAtCents') || !partial) data.compareAtCents = readMoneyCents(b.compareAtCents, 'compareAtCents', true);
    const effectivePrice = data.priceCents !== undefined ? data.priceCents : undefined;
    if (effectivePrice !== undefined && data.compareAtCents !== null && data.compareAtCents !== undefined && data.compareAtCents <= effectivePrice) {
      throw new HttpError(400, 'compareAtCents deve ser maior que priceCents.');
    }
    if (!partial || has('stock')) data.stock = readStock(b.stock ?? 0);
    if (has('featured') || !partial) data.featured = readBool(b.featured, 'featured', false);
    if (has('imageUrl') || !partial) data.imageUrl = readString(b.imageUrl, 'imageUrl', 0, 500, true);

    if (has('specifications')) {
      if (!Array.isArray(b.specifications)) throw new HttpError(400, 'specifications deve ser array.');
      data.specifications = b.specifications.slice(0, 50).map((s, i) => ({
        label: readString(s?.label, 'specification.label', 1, 80),
        value: readString(s?.value, 'specification.value', 1, 200),
        sortOrder: Number.isInteger(Number(s?.sortOrder)) ? Number(s.sortOrder) : i,
      }));
    }
    if (!partial) {
      for (const k of ['name','slug','description','categoryId','priceCents','stock']) if (data[k] === undefined) throw new HttpError(400, `Campo ${k} é obrigatório.`);
    }
    if (partial && Object.keys(data).length === 0) throw new HttpError(400, 'Nenhum campo para atualizar.');
    req.validatedProduct = data;
    next();
  } catch (e) { next(e); }
};

const validateStockBody = (req, _res, next) => {
  try { req.validatedStock = { stock: readStock(req.body?.stock) }; next(); } catch (e) { next(e); }
};

const validateOrderStatusBody = (req, _res, next) => {
  try {
    const b = req.body || {};
    const data = {};
    if (b.status !== undefined) {
      const status = readString(b.status, 'status', 2, 30).toUpperCase();
      if (!ORDER_STATUSES.has(status)) throw new HttpError(400, 'Status de pedido inválido.');
      data.status = status;
    }
    if (b.paymentStatus !== undefined) {
      const ps = readString(b.paymentStatus, 'paymentStatus', 2, 30).toUpperCase();
      if (!PAYMENT_STATUSES.has(ps)) throw new HttpError(400, 'Status de pagamento inválido.');
      data.paymentStatus = ps;
    }
    if (!Object.keys(data).length) throw new HttpError(400, 'Informe status ou paymentStatus.');
    req.validatedOrderStatus = data;
    next();
  } catch (e) { next(e); }
};

const validateCustomerStatusBody = (req, _res, next) => {
  try {
    const active = readBool(req.body?.active, 'active');
    if (active === undefined) throw new HttpError(400, 'Campo active é obrigatório.');
    req.validatedCustomerStatus = { active };
    next();
  } catch (e) { next(e); }
};

module.exports = { validateCategoryBody, validateProductBody, validateStockBody, validateOrderStatusBody, validateCustomerStatusBody, ORDER_STATUSES, PAYMENT_STATUSES, ROLES };
