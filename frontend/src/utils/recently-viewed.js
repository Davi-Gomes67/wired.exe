import { readStorage, writeStorage } from './storage';

const KEY = 'wired.exe.recently-viewed.v1';
const LIMIT = 8;

export const getRecentlyViewed = () => {
  const items = readStorage(KEY, []);
  return Array.isArray(items) ? items.filter((i) => i && i.slug) : [];
};

export const addRecentlyViewed = (product) => {
  if (!product?.slug) return getRecentlyViewed();
  const entry = {
    id: product.id, slug: product.slug, name: product.name, imageUrl: product.imageUrl || null,
    brand: product.brand || null, priceCents: Number(product.priceCents || 0), stock: Number(product.stock || 0),
    category: product.category ?{ name: product.category.name, slug: product.category.slug } : null,
  };
  const next = [entry, ...getRecentlyViewed().filter((i) => i.slug !== entry.slug)].slice(0, LIMIT);
  writeStorage(KEY, next);
  return next;
};
