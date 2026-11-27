const prisma = require('../config/prisma');
const { HttpError } = require('../utils/http-error');

const ORDER_STATUSES = new Set(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
const PAYMENT_STATUSES = new Set(['NOT_PROCESSED', 'PAID', 'REFUNDED', 'FAILED']);
const ROLES = new Set(['CUSTOMER', 'ADMIN']);
const ARTICLE_STATUSES = new Set(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
const JOURNAL_CATEGORIES = new Set(['HARDWARE', 'SOFTWARE', 'RETRO_COMPUTING', 'DIGITAL_CULTURE', 'DIY_PROJECTS', 'GEEK_CULTURE']);

const readInt = (value, field) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, `${field} inv?lido.`);
  return n;
};

const readString = (value, field, min, max, optional = false) => {
  if ((value === undefined || value === null || value === '') && optional) return null;
  if (typeof value !== 'string') throw new HttpError(400, `O campo ${field} deve ser um texto.`);
  const t = value.trim();
  if (!t && optional) return null;
  if (t.length < min || t.length > max) throw new HttpError(400, `O campo ${field} deve ter entre ${min} e ${max} caracteres.`);
  return t;
};

const readSlug = (value, field = 'slug') => {
  const slug = readString(value, field, 2, 140).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) throw new HttpError(400, 'Slug inv?lido.');
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
  if (!Number.isInteger(n) || n < 0) throw new HttpError(400, `O campo ${field} deve ser um número inteiro maior ou igual a zero.`);
  return n;
};

const readStock = (value, field = 'stock') => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 999999) throw new HttpError(400, 'Estoque inv?lido.');
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
      for (const k of ['name','slug','description','categoryId','priceCents','stock']) if (data[k] === undefined) throw new HttpError(400, `Campo ${k} ? obrigat?rio.`);
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
      if (!ORDER_STATUSES.has(status)) throw new HttpError(400, 'Status de pedido inv?lido.');
      data.status = status;
    }
    if (b.paymentStatus !== undefined) {
      const ps = readString(b.paymentStatus, 'paymentStatus', 2, 30).toUpperCase();
      if (!PAYMENT_STATUSES.has(ps)) throw new HttpError(400, 'Status de pagamento inv?lido.');
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
    if (active === undefined) throw new HttpError(400, 'Campo active ? obrigat?rio.');
    req.validatedCustomerStatus = { active };
    next();
  } catch (e) { next(e); }
};

const ALLOWED_BLOCK_TYPES = new Set(['heading', 'subheading', 'paragraph', 'list', 'quote', 'code', 'image', 'divider', 'link']);
const ALLOWED_LIST_TYPES = new Set(['ordered', 'unordered']);
const isSafeUrl = (v) => typeof v === 'string' && /^(https?:\/\/|\/uploads\/journal\/|\/)/i.test(v.trim());
const estimateReadingMinutes = (blocks) => {
  const text = blocks.map((b) => [b.text, ...(Array.isArray(b.items) ? b.items : [])].filter(Boolean).join(' ')).join(' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

const validateArticleBlocks = (value) => {
  if (!Array.isArray(value)) throw new HttpError(400, 'content deve ser um array de blocos.');
  if (value.length > 120) throw new HttpError(400, 'content excede o limite de blocos.');
  return value.map((raw, index) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new HttpError(400, `Bloco ${index + 1} inv?lido.`);
    const type = readString(raw.type, `content[${index}].type`, 2, 30).toLowerCase();
    if (!ALLOWED_BLOCK_TYPES.has(type)) throw new HttpError(400, `Tipo de bloco inv?lido: ${type}.`);
    const block = { type };
    if (type === 'divider') return block;
    if (type === 'list') {
      if (!Array.isArray(raw.items) || !raw.items.length) throw new HttpError(400, `Lista do bloco ${index + 1} inv?lida.`);
      block.items = raw.items.slice(0, 30).map((item, i) => readString(item, `content[${index}].items[${i}]`, 1, 300));
      block.ordered = raw.ordered === true || raw.listType === 'ordered';
      if (raw.listType !== undefined) {
        const lt = readString(raw.listType, `content[${index}].listType`, 3, 20).toLowerCase();
        if (!ALLOWED_LIST_TYPES.has(lt)) throw new HttpError(400, 'listType inv?lido.');
        block.ordered = lt === 'ordered';
      }
      return block;
    }
    if (type === 'image') {
      const url = readString(raw.url, `content[${index}].url`, 1, 500);
      if (!isSafeUrl(url)) throw new HttpError(400, 'URL de imagem inv?lida.');
      block.url = url;
      block.alt = readString(raw.alt, `content[${index}].alt`, 0, 160, true);
      block.caption = readString(raw.caption, `content[${index}].caption`, 0, 240, true);
      return block;
    }
    if (type === 'link') {
      block.text = readString(raw.text, `content[${index}].text`, 1, 240);
      const href = readString(raw.href || raw.url, `content[${index}].href`, 1, 500);
      if (!isSafeUrl(href)) throw new HttpError(400, 'URL de link inv?lida.');
      block.href = href;
      return block;
    }
    block.text = readString(raw.text, `content[${index}].text`, 1, type === 'code' ?6000 : 4000);
    if (type === 'quote') block.cite = readString(raw.cite, `content[${index}].cite`, 0, 160, true);
    return block;
  });
};

const validateArticleBody = (partial = false) => (req, _res, next) => {
  try {
    const b = req.body || {};
    const has = (k) => b[k] !== undefined;
    const data = {};
    if (!partial || has('title')) data.title = readString(b.title, 'title', 3, 160);
    if (!partial || has('slug')) data.slug = b.slug ? readSlug(b.slug) : (data.title ? readSlug(data.title) : undefined);
    if (has('subtitle') || !partial) data.subtitle = readString(b.subtitle, 'subtitle', 0, 240, true);
    if (!partial || has('excerpt')) data.excerpt = readString(b.excerpt, 'excerpt', 10, 400);
    if (!partial || has('category')) {
      const category = readString(b.category, 'category', 2, 40).toUpperCase().replace(/[\s-]+/g, '_');
      if (!JOURNAL_CATEGORIES.has(category)) throw new HttpError(400, 'Categoria editorial inv?lida.');
      data.category = category;
    }
    if (!partial || has('authorName')) data.authorName = readString(b.authorName, 'authorName', 2, 120);
    if (has('coverImageUrl') || !partial) {
      const cover = readString(b.coverImageUrl, 'coverImageUrl', 0, 500, true);
      if (cover && !isSafeUrl(cover)) throw new HttpError(400, 'coverImageUrl inv?lida.');
      data.coverImageUrl = cover;
    }
    if (!partial || has('content')) {
      const blocks = validateArticleBlocks(b.content ?? []);
      data.content = JSON.stringify(blocks);
      data.readingTimeMinutes = estimateReadingMinutes(blocks);
    }
    if (has('status') || !partial) {
      const status = readString(b.status ?? 'DRAFT', 'status', 3, 20).toUpperCase();
      if (!ARTICLE_STATUSES.has(status)) throw new HttpError(400, 'Status de artigo inv?lido.');
      data.status = status;
    }
    if (has('featured') || !partial) data.featured = readBool(b.featured, 'featured', false);
    if (has('publishedAt')) {
      if (b.publishedAt === null || b.publishedAt === '') data.publishedAt = null;
      else {
        const d = new Date(b.publishedAt);
        if (Number.isNaN(d.getTime())) throw new HttpError(400, 'publishedAt inv?lido.');
        data.publishedAt = d;
      }
    }
    if (has('relatedProductIds')) {
      if (!Array.isArray(b.relatedProductIds)) throw new HttpError(400, 'relatedProductIds deve ser array.');
      const ids = [...new Set(b.relatedProductIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))].slice(0, 8);
      data.relatedProductIds = ids;
    }
    if (!partial) {
      for (const k of ['title','slug','excerpt','category','authorName','content','status']) if (data[k] === undefined) throw new HttpError(400, `Campo ${k} ? obrigat?rio.`);
    }
    if (partial && Object.keys(data).length === 0) throw new HttpError(400, 'Nenhum campo para atualizar.');
    req.validatedArticle = data;
    next();
  } catch (e) { next(e); }
};

const validateArticleStatusBody = (req, _res, next) => {
  try {
    const status = readString(req.body?.status, 'status', 3, 20).toUpperCase();
    if (!ARTICLE_STATUSES.has(status)) throw new HttpError(400, 'Status de artigo inv?lido.');
    req.validatedArticleStatus = { status };
    next();
  } catch (e) { next(e); }
};

module.exports = { validateCategoryBody, validateProductBody, validateStockBody, validateOrderStatusBody, validateCustomerStatusBody, validateArticleBody, validateArticleStatusBody, ORDER_STATUSES, PAYMENT_STATUSES, ROLES, ARTICLE_STATUSES, JOURNAL_CATEGORIES };

