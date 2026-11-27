const prisma = require('../../config/prisma');
const { HttpError } = require('../../utils/http-error');

const productSelect = { id: true, name: true, slug: true, brand: true, priceCents: true, stock: true, imageUrl: true, featured: true, archived: true, category: { select: { id: true, name: true } } };

const getFeatured = async () => {
  const [featured, candidates] = await Promise.all([
    prisma.product.findMany({ where: { archived: false, featured: true }, orderBy: [{ updatedAt: 'desc' }, { name: 'asc' }], select: productSelect }),
    prisma.product.findMany({ where: { archived: false }, orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }], take: 60, select: productSelect }),
  ]);
  return { featured, candidates };
};

const updateFeatured = async (productIds) => {
  if (!Array.isArray(productIds)) throw new HttpError(400, 'productIds deve ser um array.');
  const ids = [...new Set(productIds.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n > 0))].slice(0, 12);
  const products = ids.length ?await prisma.product.findMany({ where: { id: { in: ids }, archived: false }, select: { id: true } }) : [];
  if (products.length !== ids.length) throw new HttpError(400, 'Um ou mais produtos são inválidos ou arquivados.');
  await prisma.$transaction([
    prisma.product.updateMany({ where: { featured: true }, data: { featured: false } }),
    ...(ids.length ?[prisma.product.updateMany({ where: { id: { in: ids } }, data: { featured: true } })] : []),
  ]);
  return getFeatured();
};

module.exports = { getFeatured, updateFeatured };
