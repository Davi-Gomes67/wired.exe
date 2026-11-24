const prisma = require('../config/prisma');

const listCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: { where: { archived: false } } } } },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    productCount: category._count.products,
  }));
};

module.exports = { listCategories };
