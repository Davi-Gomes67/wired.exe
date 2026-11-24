const { Router } = require('express');
const { listProducts, getProductBySlug, listBrands } = require('../controllers/products.controller');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    await listProducts(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/brands/list', async (_req, res, next) => {
  try {
    await listBrands(_req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', getProductBySlug);

module.exports = router;
