const { HttpError } = require('../utils/http-error');
const dashboard = require('../services/admin/dashboard.service');
const categories = require('../services/admin/categories.service');
const products = require('../services/admin/products.service');
const orders = require('../services/admin/orders.service');
const customers = require('../services/admin/customers.service');
const featured = require('../services/admin/featured.service');
const media = require('../services/admin/media.service');
const settings = require('../services/admin/settings.service');
const activity = require('../services/admin/activity.service');
const rootAccess = require('../services/root-access.service');
const journal = require('../services/admin/journal.service');

const wrap = (fn) => async (req, res, next) => { try { await fn(req, res, next); } catch (e) { next(e); } };
const idParam = (req) => { const id = Number(req.params.id); if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID inválido.'); return id; };

exports.dashboard = wrap(async (req, res) => res.json({ data: await dashboard.getDashboard(req.query) }));
exports.listActivities = wrap(async (req, res) => res.json({ data: await activity.listActivities(req.query.limit) }));

exports.listCategories = wrap(async (_req, res) => res.json({ data: await categories.listCategories() }));
exports.createCategory = wrap(async (req, res) => {
  const data = await categories.createCategory(req.validatedCategory);
  await activity.logActivity({ action: 'CREATE', entityType: 'CATEGORY', entityId: data.id, entityLabel: data.name, actor: req.user });
  res.status(201).json({ data });
});
exports.updateCategory = wrap(async (req, res) => {
  const data = await categories.updateCategory(idParam(req), req.validatedCategory);
  await activity.logActivity({ action: 'UPDATE', entityType: 'CATEGORY', entityId: data.id, entityLabel: data.name, actor: req.user });
  res.json({ data });
});
exports.deleteCategory = wrap(async (req, res) => {
  const id = idParam(req); await categories.deleteCategory(id);
  await activity.logActivity({ action: 'DELETE', entityType: 'CATEGORY', entityId: id, actor: req.user });
  res.status(204).send();
});

exports.listProducts = wrap(async (req, res) => res.json(await products.listProducts(req.query)));
exports.getProduct = wrap(async (req, res) => res.json({ data: await products.getProduct(idParam(req)) }));
exports.createProduct = wrap(async (req, res) => {
  const data = await products.createProduct(req.validatedProduct);
  await activity.logActivity({ action: 'CREATE', entityType: 'PRODUCT', entityId: data.id, entityLabel: data.name, actor: req.user });
  res.status(201).json({ data });
});
exports.updateProduct = wrap(async (req, res) => {
  const data = await products.updateProduct(idParam(req), req.validatedProduct);
  await activity.logActivity({ action: 'UPDATE', entityType: 'PRODUCT', entityId: data.id, entityLabel: data.name, actor: req.user });
  res.json({ data });
});
exports.deleteProduct = wrap(async (req, res) => {
  const id = idParam(req);
  const result = await products.deleteProduct(id);
  await activity.logActivity({ action: result.archived ? 'ARCHIVE' : 'DELETE', entityType: 'PRODUCT', entityId: id, actor: req.user, metadata: { archived: result.archived } });
  if (result.archived) return res.json({ data: { archived: true, message: 'Produto possui pedidos vinculados e foi arquivado.' } });
  res.status(204).send();
});
exports.updateStock = wrap(async (req, res) => {
  const data = await products.updateStock(idParam(req), req.validatedStock.stock);
  await activity.logActivity({ action: 'UPDATE_STOCK', entityType: 'PRODUCT', entityId: data.id, entityLabel: data.name, actor: req.user, metadata: { stock: data.stock } });
  res.json({ data });
});
exports.addProductImages = wrap(async (req, res) => {
  const data = await products.addImages(idParam(req), req.files);
  await activity.logActivity({ action: 'UPLOAD_IMAGES', entityType: 'PRODUCT', entityId: data.id, entityLabel: data.name, actor: req.user, metadata: { count: req.files?.length || 0 } });
  res.status(201).json({ data });
});
exports.removeProductImage = wrap(async (req, res) => {
  const id = idParam(req); await products.removeImage(id);
  await activity.logActivity({ action: 'REMOVE_IMAGE', entityType: 'PRODUCT_IMAGE', entityId: id, actor: req.user });
  res.status(204).send();
});

exports.listOrders = wrap(async (req, res) => res.json(await orders.listOrders(req.query)));
exports.getOrder = wrap(async (req, res) => res.json({ data: await orders.getOrder(idParam(req)) }));
exports.updateOrderStatus = wrap(async (req, res) => {
  const data = await orders.updateOrderStatus(idParam(req), req.validatedOrderStatus);
  await activity.logActivity({ action: 'UPDATE_STATUS', entityType: 'ORDER', entityId: data.id, entityLabel: data.orderCode, actor: req.user, metadata: req.validatedOrderStatus });
  res.json({ data });
});

exports.listCustomers = wrap(async (req, res) => res.json(await customers.listCustomers(req.query)));
exports.getCustomer = wrap(async (req, res) => res.json({ data: await customers.getCustomer(idParam(req)) }));
exports.updateCustomerStatus = wrap(async (req, res) => {
  const data = await customers.updateCustomerStatus(idParam(req), req.validatedCustomerStatus.active);
  await activity.logActivity({ action: 'UPDATE_STATUS', entityType: 'CUSTOMER', entityId: data.id, entityLabel: data.email, actor: req.user, metadata: { active: data.active } });
  res.json({ data });
});

exports.getFeatured = wrap(async (_req, res) => res.json({ data: await featured.getFeatured() }));
exports.updateFeatured = wrap(async (req, res) => {
  const data = await featured.updateFeatured(req.body?.productIds);
  await activity.logActivity({ action: 'UPDATE_FEATURED', entityType: 'PRODUCT', entityLabel: 'Destaques', actor: req.user, metadata: { count: data.featured?.length || 0 } });
  res.json({ data });
});

exports.listMedia = wrap(async (_req, res) => res.json({ data: await media.listMedia() }));

exports.getSettings = wrap(async (_req, res) => res.json({ data: await settings.getRawSettings() }));
exports.updateSettings = wrap(async (req, res) => {
  const data = await settings.updateSettings(req.body || {});
  await activity.logActivity({ action: 'UPDATE', entityType: 'SETTINGS', entityLabel: 'Configurações', actor: req.user });
  res.json({ data });
});

exports.listRootAccessSubscriptions = wrap(async (_req, res) => res.json({ data: await rootAccess.listAdmin() }));
exports.updateRootAccessStatus = wrap(async (req, res) => {
  const data = await rootAccess.updateStatus(idParam(req), req.body?.status);
  await activity.logActivity({ action: 'UPDATE_STATUS', entityType: 'ROOT_ACCESS', entityId: data.id, entityLabel: data.email, actor: req.user, metadata: { status: data.status } });
  res.json({ data });
});

exports.listJournalArticles = wrap(async (req, res) => res.json(await journal.listArticles(req.query)));
exports.getJournalArticle = wrap(async (req, res) => res.json({ data: await journal.getArticle(idParam(req)) }));
exports.createJournalArticle = wrap(async (req, res) => {
  const data = await journal.createArticle(req.validatedArticle);
  await activity.logActivity({ action: 'CREATE', entityType: 'ARTICLE', entityId: data.id, entityLabel: data.title, actor: req.user, metadata: { status: data.status } });
  res.status(201).json({ data });
});
exports.updateJournalArticle = wrap(async (req, res) => {
  const data = await journal.updateArticle(idParam(req), req.validatedArticle);
  await activity.logActivity({ action: 'UPDATE', entityType: 'ARTICLE', entityId: data.id, entityLabel: data.title, actor: req.user, metadata: { status: data.status } });
  res.json({ data });
});
exports.deleteJournalArticle = wrap(async (req, res) => {
  const id = idParam(req); await journal.deleteArticle(id);
  await activity.logActivity({ action: 'DELETE', entityType: 'ARTICLE', entityId: id, actor: req.user });
  res.status(204).send();
});
exports.updateJournalArticleStatus = wrap(async (req, res) => {
  const data = await journal.setStatus(idParam(req), req.validatedArticleStatus.status);
  await activity.logActivity({ action: 'UPDATE_STATUS', entityType: 'ARTICLE', entityId: data.id, entityLabel: data.title, actor: req.user, metadata: { status: data.status } });
  res.json({ data });
});
exports.uploadJournalCover = wrap(async (req, res) => {
  const data = await journal.uploadCover(idParam(req), req.file);
  await activity.logActivity({ action: 'UPLOAD_COVER', entityType: 'ARTICLE', entityId: data.id, entityLabel: data.title, actor: req.user });
  res.json({ data });
});
