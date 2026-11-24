const { HttpError } = require('../utils/http-error');
const dashboard = require('../services/admin/dashboard.service');
const categories = require('../services/admin/categories.service');
const products = require('../services/admin/products.service');
const orders = require('../services/admin/orders.service');
const customers = require('../services/admin/customers.service');

const wrap = (fn) => async (req, res, next) => { try { await fn(req, res, next); } catch (e) { next(e); } };
const idParam = (req) => { const id = Number(req.params.id); if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID inválido.'); return id; };

exports.dashboard = wrap(async (_req, res) => res.json({ data: await dashboard.getDashboard() }));

exports.listCategories = wrap(async (_req, res) => res.json({ data: await categories.listCategories() }));
exports.createCategory = wrap(async (req, res) => res.status(201).json({ data: await categories.createCategory(req.validatedCategory) }));
exports.updateCategory = wrap(async (req, res) => res.json({ data: await categories.updateCategory(idParam(req), req.validatedCategory) }));
exports.deleteCategory = wrap(async (req, res) => { await categories.deleteCategory(idParam(req)); res.status(204).send(); });

exports.listProducts = wrap(async (req, res) => res.json(await products.listProducts(req.query)));
exports.getProduct = wrap(async (req, res) => res.json({ data: await products.getProduct(idParam(req)) }));
exports.createProduct = wrap(async (req, res) => res.status(201).json({ data: await products.createProduct(req.validatedProduct) }));
exports.updateProduct = wrap(async (req, res) => res.json({ data: await products.updateProduct(idParam(req), req.validatedProduct) }));
exports.deleteProduct = wrap(async (req, res) => {
  const result = await products.deleteProduct(idParam(req));
  if (result.archived) return res.json({ data: { archived: true, message: 'Produto possui pedidos vinculados e foi arquivado.' } });
  res.status(204).send();
});
exports.updateStock = wrap(async (req, res) => res.json({ data: await products.updateStock(idParam(req), req.validatedStock.stock) }));
exports.addProductImages = wrap(async (req, res) => res.status(201).json({ data: await products.addImages(idParam(req), req.files) }));
exports.removeProductImage = wrap(async (req, res) => { await products.removeImage(idParam(req)); res.status(204).send(); });

exports.listOrders = wrap(async (req, res) => res.json(await orders.listOrders(req.query)));
exports.getOrder = wrap(async (req, res) => res.json({ data: await orders.getOrder(idParam(req)) }));
exports.updateOrderStatus = wrap(async (req, res) => res.json({ data: await orders.updateOrderStatus(idParam(req), req.validatedOrderStatus) }));

exports.listCustomers = wrap(async (req, res) => res.json(await customers.listCustomers(req.query)));
exports.getCustomer = wrap(async (req, res) => res.json({ data: await customers.getCustomer(idParam(req)) }));
exports.updateCustomerStatus = wrap(async (req, res) => res.json({ data: await customers.updateCustomerStatus(idParam(req), req.validatedCustomerStatus.active) }));
