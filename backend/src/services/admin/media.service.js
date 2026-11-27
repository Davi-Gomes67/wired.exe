const fs = require('node:fs');
const path = require('node:path');
const prisma = require('../../config/prisma');

const UPLOAD_DIR = path.resolve(__dirname, '../../../../uploads/products');
const JOURNAL_DIR = path.resolve(__dirname, '../../../../uploads/journal');

const parseArticleContent = (raw) => { try { const p = JSON.parse(raw || '[]'); return Array.isArray(p) ? p : []; } catch { return []; } };

const listMedia = async () => {
  const [images, total, noImage, articles] = await Promise.all([
    prisma.productImage.findMany({ include: { product: { select: { id: true, name: true, slug: true, archived: true } } }, orderBy: { id: 'desc' }, take: 200 }),
    prisma.productImage.count(),
    prisma.product.findMany({ where: { archived: false, imageUrl: null, images: { none: {} } }, select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' }, take: 100 }),
    prisma.article.findMany({ select: { id: true, title: true, slug: true, coverImageUrl: true, content: true }, orderBy: { updatedAt: 'desc' }, take: 200 }),
  ]);
  let files = [];
  try {
    files = fs.readdirSync(UPLOAD_DIR).filter((f) => !f.startsWith('.')).map((name) => {
      const full = path.join(UPLOAD_DIR, name);
      const stat = fs.statSync(full);
      return { name, url: `/uploads/products/${name}`, bytes: stat.size, mtime: stat.mtime.toISOString() };
    }).sort((a, b) => (a.mtime < b.mtime ? 1 : -1));
  } catch {
    files = [];
  }
  const referenced = new Set(images.map((i) => path.basename(i.url || '')));
  const orphans = files.filter((f) => !referenced.has(f.name)).slice(0, 100);

  let journalFiles = [];
  try {
    journalFiles = fs.readdirSync(JOURNAL_DIR).filter((f) => !f.startsWith('.')).map((name) => {
      const full = path.join(JOURNAL_DIR, name);
      const stat = fs.statSync(full);
      return { name, url: `/uploads/journal/${name}`, bytes: stat.size, mtime: stat.mtime.toISOString() };
    }).sort((a, b) => (a.mtime < b.mtime ? 1 : -1));
  } catch { journalFiles = []; }
  const journalReferenced = new Set();
  for (const a of articles) {
    if (a.coverImageUrl) journalReferenced.add(path.basename(a.coverImageUrl));
    for (const b of parseArticleContent(a.content)) if (b?.type === 'image' && b.url) journalReferenced.add(path.basename(b.url));
  }
  const journalOrphans = journalFiles.filter((f) => !journalReferenced.has(f.name)).slice(0, 100);

  return { images, total, noImageProducts: noImage, orphanFiles: orphans, journalImages: journalFiles.slice(0, 100), journalOrphanFiles: journalOrphans, journalArticles: articles.map(({ content, ...a }) => a) };
};

module.exports = { listMedia };
