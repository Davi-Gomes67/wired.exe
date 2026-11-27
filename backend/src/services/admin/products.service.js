const fs = require('node:fs');
const path = require('node:path');
const prisma = require('../../config/prisma');
const { HttpError } = require('../../utils/http-error');

const UPLOAD_DIR = path.resolve(__dirname, '../../../../uploads/products');
const safeUnlinkUpload = (url) => {
  if (typeof url !== 'string' || !url.startsWith('/uploads/products/')) return;
  const file = path.resolve(UPLOAD_DIR, path.basename(url));
  if (!file.startsWith(UPLOAD_DIR)) return;
  try { fs.unlinkSync(file); } catch {}
};

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { sortOrder: 'asc' } },
  specifications: { orderBy: { sortOrder: 'asc' } },
  _count: { select: { orderItems: true } },
};

const listProducts = async (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
  const q = typeof query.q === 'string' ?query.q.trim() : '';
  const where = {};
  if (q) where.OR = [{ name: { contains: q } }, { slug: { contains: q } }, { brand: { contains: q } }];
  if (query.categoryId) where.categoryId = Number(query.categoryId);
  if (query.archived === 'true') where.archived = true;
  else if (query.archived === 'false') where.archived = false;
  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, include: productInclude, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  return { items, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
};

const getProduct = async (id) => {
  const product = await prisma.product.findUnique({ where: { id }, include: productInclude });
  if (!product) throw new HttpError(404, 'Produto n?o encontrado.');
  return product;
};

const createProduct = async (data) => {
  const { specifications, ...productData } = data;
  const category = await prisma.category.findUnique({ where: { id: productData.categoryId }, select: { id: true } });
  if (!category) throw new HttpError(400, 'Categoria inv?lida.');
  try {
    return await prisma.product.create({
      data: { ...productData, specifications: specifications ?{ create: specifications } : undefined },
      include: productInclude,
    });
  } catch (e) { if (e.code === 'P2002') throw new HttpError(409, 'Slug de produto j? existe.'); throw e; }
};

const updateProduct = async (id, data) => {
  const existing = await getProduct(id);
  const { specifications, ...productData } = data;
  if (productData.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: productData.categoryId }, select: { id: true } });
    if (!category) throw new HttpError(400, 'Categoria inválida.');
  }
  const nextPrice = productData.priceCents !== undefined ? productData.priceCents : existing.priceCents;
  const nextCompare = productData.compareAtCents !== undefined ? productData.compareAtCents : existing.compareAtCents;
  if (nextCompare !== null && nextCompare !== undefined && nextCompare <= nextPrice) {
    throw new HttpError(400, 'compareAtCents deve ser maior que priceCents.');
  }
  try {
    return await prisma.$transaction(async (tx) => {
      if (specifications) {
        await tx.productSpecification.deleteMany({ where: { productId: id } });
      }
      return tx.product.update({
        where: { id },
        data: { ...productData, specifications: specifications ?{ create: specifications } : undefined },
        include: productInclude,
      });
    });
  } catch (e) { if (e.code === 'P2002') throw new HttpError(409, 'Slug de produto já existe.'); throw e; }
};

const deleteProduct = async (id) => {
  const product = await getProduct(id);
  const orderItems = await prisma.orderItem.count({ where: { productId: id } });
  if (orderItems > 0) {
    await prisma.product.update({
      where: { id },
      data: { archived: true, featured: false, stock: 0 },
    });
    return { archived: true, id: product.id };
  }
  await prisma.product.delete({ where: { id } });
  return { archived: false, id: product.id };
};

const updateStock = async (id, stock) => {
  await getProduct(id);
  return prisma.product.update({ where: { id }, data: { stock }, include: productInclude });
};

const addImages = async (id, files) => {
  await getProduct(id);
  if (!files || !files.length) throw new HttpError(400, 'Nenhuma imagem enviada.');
  const current = await prisma.productImage.count({ where: { productId: id } });
  const data = files.map((file, i) => ({
    productId: id,
    url: `/uploads/products/${file.filename}`,
    alt: file.originalname?.slice(0, 120) || null,
    sortOrder: current + i,
  }));
  await prisma.productImage.createMany({ data });
  const first = await prisma.productImage.findFirst({ where: { productId: id }, orderBy: { sortOrder: 'asc' } });
  await prisma.product.update({ where: { id }, data: { imageUrl: first?.url || null } });
  return getProduct(id);
};

const removeImage = async (imageId) => {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) throw new HttpError(404, 'Imagem n?o encontrada.');
  await prisma.productImage.delete({ where: { id: imageId } });
  safeUnlinkUpload(image.url);
  const first = await prisma.productImage.findFirst({ where: { productId: image.productId }, orderBy: { sortOrder: 'asc' } });
  await prisma.product.update({ where: { id: image.productId }, data: { imageUrl: first?.url || null } });
  return { productId: image.productId };
};
module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct, updateStock, addImages, removeImage };


