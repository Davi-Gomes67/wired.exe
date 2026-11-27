const { Router } = require('express');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');
const { upload, journalUpload, validateUploadedImages } = require('../middlewares/upload.middleware');
const { validateCategoryBody, validateProductBody, validateStockBody, validateOrderStatusBody, validateCustomerStatusBody, validateArticleBody, validateArticleStatusBody } = require('../middlewares/validate-admin.middleware');
const { validateModerationPostBody, validateModerationCommentBody, validateReportStatusBody } = require('../middlewares/validate-community.middleware');
const admin = require('../controllers/admin.controller');
const community = require('../controllers/admin/community.controller');

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/dashboard', admin.dashboard);
router.get('/activities', admin.listActivities);

router.get('/categories', admin.listCategories);
router.post('/categories', validateCategoryBody, admin.createCategory);
router.put('/categories/:id', validateCategoryBody, admin.updateCategory);
router.delete('/categories/:id', admin.deleteCategory);

router.get('/products', admin.listProducts);
router.get('/products/:id', admin.getProduct);
router.post('/products', validateProductBody(false), admin.createProduct);
router.put('/products/:id', validateProductBody(true), admin.updateProduct);
router.delete('/products/:id', admin.deleteProduct);
router.patch('/products/:id/stock', validateStockBody, admin.updateStock);
router.post('/products/:id/images', upload.array('images', 5), validateUploadedImages, admin.addProductImages);
router.delete('/products/images/:id', admin.removeProductImage);

router.get('/orders', admin.listOrders);
router.get('/orders/:id', admin.getOrder);
router.patch('/orders/:id/status', validateOrderStatusBody, admin.updateOrderStatus);

router.get('/customers', admin.listCustomers);
router.get('/customers/:id', admin.getCustomer);
router.patch('/customers/:id/status', validateCustomerStatusBody, admin.updateCustomerStatus);

router.get('/featured', admin.getFeatured);
router.put('/featured', admin.updateFeatured);

router.get('/media', admin.listMedia);

router.get('/settings', admin.getSettings);
router.put('/settings', admin.updateSettings);

router.get('/root-access/subscriptions', admin.listRootAccessSubscriptions);
router.patch('/root-access/subscriptions/:id/status', admin.updateRootAccessStatus);

router.get('/journal', admin.listJournalArticles);
router.get('/journal/:id', admin.getJournalArticle);
router.post('/journal', validateArticleBody(false), admin.createJournalArticle);
router.put('/journal/:id', validateArticleBody(true), admin.updateJournalArticle);
router.delete('/journal/:id', admin.deleteJournalArticle);
router.patch('/journal/:id/status', validateArticleStatusBody, admin.updateJournalArticleStatus);
router.post('/journal/:id/cover', journalUpload.single('cover'), validateUploadedImages, admin.uploadJournalCover);

router.get('/community/posts', community.listPosts);
router.patch('/community/posts/:id/status', validateModerationPostBody, community.updatePostStatus);
router.get('/community/comments', community.listComments);
router.patch('/community/comments/:id/status', validateModerationCommentBody, community.updateCommentStatus);
router.get('/community/reports', community.listReports);
router.patch('/community/reports/:id', validateReportStatusBody, community.updateReport);

module.exports = router;
