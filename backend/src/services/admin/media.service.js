const fs = require('node:fs');
const path = require('node:path');
const prisma = require('../../config/prisma');

const UPLOAD_DIR = path.resolve(__dirname, '../../../../uploads/products');

const listMedia = async () => {
  const [images, total, noImage] = await Promise.all([
    prisma.productImage.findMany({ include: { product: { select: { id: true, name: true, slug: true, archived: true } } }, orderBy: { id: 'desc' }, take: 200 }),
    prisma.productImage.count(),
    prisma.product.findMany({ where: { archived: false, imageUrl: null, images: { none: {} } }, select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' }, take: 100 }),
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
  return { images, total, noImageProducts: noImage, orphanFiles: orphans };
};

module.exports = { listMedia };
