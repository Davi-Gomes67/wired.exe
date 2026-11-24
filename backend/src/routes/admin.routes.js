const { Router } = require('express');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');
const { upload, validateUploadedImages } = require('../middlewares/upload.middleware');
const { validateCategoryBody, validateProductBody, validateStockBody, validateOrderStatusBody, validateCustomerStatusBody } = require('../middlewares/validate-admin.middleware');
const admin = require('../controllers/admin.controller');

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/dashboard', admin.dashboard);

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

module.exports = router;
