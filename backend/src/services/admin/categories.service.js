const prisma = require('../../config/prisma');
const { HttpError } = require('../../utils/http-error');

const listCategories = async () => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { products: true } } } });
  return categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description, productCount: c._count.products, createdAt: c.createdAt }));
};

const createCategory = async (data) => {
  try { return await prisma.category.create({ data }); }
  catch (e) { if (e.code === 'P2002') throw new HttpError(409, 'Categoria ou slug jÃ¡ existe.'); throw e; }
};

const updateCategory = async (id, data) => {
  const existing = await prisma.category.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new HttpError(404, 'Categoria nÃ£o encontrada.');
  try { return await prisma.category.update({ where: { id }, data }); }
  catch (e) { if (e.code === 'P2002') throw new HttpError(409, 'Categoria ou slug jÃ¡ existe.'); throw e; }
};

const deleteCategory = async (id) => {
  const existing = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
  if (!existing) throw new HttpError(404, 'Categoria nÃ£o encontrada.');
  if (existing._count.products > 0) throw new HttpError(409, 'Categoria possui produtos vinculados.');
  await prisma.category.delete({ where: { id } });
};

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };

