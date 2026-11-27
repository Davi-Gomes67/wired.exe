const fs = require('node:fs');
const path = require('node:path');
const prisma = require('../../config/prisma');
const { HttpError } = require('../../utils/http-error');
const { parseContent } = require('../journal.service');

const JOURNAL_DIR = path.resolve(__dirname, '../../../../uploads/journal');
const safeUnlinkJournal = (url) => {
  if (typeof url !== 'string' || !url.startsWith('/uploads/journal/')) return;
  const file = path.resolve(JOURNAL_DIR, path.basename(url));
  if (!file.startsWith(JOURNAL_DIR)) return;
  try { fs.unlinkSync(file); } catch {}
};

const include = {
  relatedProducts: { orderBy: { sortOrder: 'asc' }, include: { product: { select: { id: true, name: true, slug: true, imageUrl: true, priceCents: true, archived: true } } } },
};

const toAdminArticle = (a) => ({ ...a, content: parseContent(a.content) });

const listArticles = async (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
  const q = typeof query.q === 'string' ?query.q.trim() : '';
  const status = typeof query.status === 'string' ?query.status.toUpperCase() : '';
  const category = typeof query.category === 'string' ?query.category.toUpperCase().replace(/[\s-]+/g, '_') : '';
  const where = {};
  if (q) where.OR = [{ title: { contains: q } }, { slug: { contains: q } }, { authorName: { contains: q } }, { excerpt: { contains: q } }];
  if (['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) where.status = status;
  if (category) where.category = category;
  const [total, items] = await Promise.all([
    prisma.article.count({ where }),
    prisma.article.findMany({ where, include, orderBy: [{ updatedAt: 'desc' }], skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  return { items: items.map(toAdminArticle), meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
};

const getArticle = async (id) => {
  const article = await prisma.article.findUnique({ where: { id }, include });
  if (!article) throw new HttpError(404, 'Artigo não encontrado.');
  return toAdminArticle(article);
};

const normalizeRelatedProducts = async (productIds) => {
  const ids = [...new Set((Array.isArray(productIds) ? productIds : []).map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, 8);
  if (!ids.length) return [];
  const found = await prisma.product.findMany({ where: { id: { in: ids }, archived: false }, select: { id: true } });
  if (found.length !== ids.length) throw new HttpError(400, 'Um ou mais produtos relacionados são inválidos.');
  return ids.map((productId, sortOrder) => ({ productId, sortOrder }));
};

const buildData = (data) => {
  const payload = { ...data };
  delete payload.relatedProductIds;
  if (payload.status === 'PUBLISHED' && !payload.publishedAt) payload.publishedAt = new Date();
  if (payload.status !== 'PUBLISHED') payload.publishedAt = payload.status === 'DRAFT' ?null : payload.publishedAt;
  return payload;
};

const createArticle = async (data) => {
  const related = await normalizeRelatedProducts(data.relatedProductIds);
  try {
    const created = await prisma.article.create({
      data: { ...buildData(data), relatedProducts: related.length ?{ create: related } : undefined },
      include,
    });
    return toAdminArticle(created);
  } catch (e) { if (e.code === 'P2002') throw new HttpError(409, 'Slug de artigo já existe.'); throw e; }
};

const updateArticle = async (id, data) => {
  const existing = await prisma.article.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new HttpError(404, 'Artigo não encontrado.');
  const related = data.relatedProductIds !== undefined ?await normalizeRelatedProducts(data.relatedProductIds) : null;
  try {
    return toAdminArticle(await prisma.$transaction(async (tx) => {
      if (related) await tx.articleRelatedProduct.deleteMany({ where: { articleId: id } });
      return tx.article.update({
        where: { id },
        data: { ...buildData(data), ...(related ?{ relatedProducts: { create: related } } : {}) },
        include,
      });
    }));
  } catch (e) { if (e.code === 'P2002') throw new HttpError(409, 'Slug de artigo já existe.'); throw e; }
};

const deleteArticle = async (id) => {
  const existing = await prisma.article.findUnique({ where: { id }, select: { id: true, coverImageUrl: true, content: true } });
  if (!existing) throw new HttpError(404, 'Artigo não encontrado.');
  await prisma.article.delete({ where: { id } });
  safeUnlinkJournal(existing.coverImageUrl);
  for (const block of parseContent(existing.content)) if (block?.type === 'image') safeUnlinkJournal(block.url);
  return { id };
};

const setStatus = async (id, status) => {
  const existing = await prisma.article.findUnique({ where: { id }, select: { id: true, publishedAt: true } });
  if (!existing) throw new HttpError(404, 'Artigo não encontrado.');
  const data = { status };
  if (status === 'PUBLISHED') data.publishedAt = existing.publishedAt || new Date();
  if (status === 'DRAFT') data.publishedAt = null;
  return toAdminArticle(await prisma.article.update({ where: { id }, data, include }));
};

const uploadCover = async (id, file) => {
  if (!file) throw new HttpError(400, 'Imagem de capa obrigatória.');
  const existing = await prisma.article.findUnique({ where: { id }, select: { id: true, coverImageUrl: true } });
  if (!existing) { try { fs.unlinkSync(file.path); } catch {} throw new HttpError(404, 'Artigo não encontrado.'); }
  const coverImageUrl = `/uploads/journal/${file.filename}`;
  const updated = await prisma.article.update({ where: { id }, data: { coverImageUrl }, include });
  safeUnlinkJournal(existing.coverImageUrl);
  return toAdminArticle(updated);
};

module.exports = { listArticles, getArticle, createArticle, updateArticle, deleteArticle, setStatus, uploadCover };