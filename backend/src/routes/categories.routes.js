const { Router } = require('express');
const { listCategories } = require('../controllers/categories.controller');

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    res.json({ data: await listCategories() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
