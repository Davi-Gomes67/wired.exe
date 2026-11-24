const { Router } = require('express');
const categoryRoutes = require('./categories.routes');
const productRoutes = require('./products.routes');
const orderRoutes = require('./orders.routes');
const cartRoutes = require('./cart.routes');
const authRoutes = require('./auth.routes');
const addressRoutes = require('./addresses.routes');
const adminRoutes = require('./admin.routes');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'WIRED.exe API', time: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/addresses', addressRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
