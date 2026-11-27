const { Router } = require('express');
const controller = require('../controllers/journal.controller');

const router = Router();
router.get('/', controller.list);
router.get('/categories/list', controller.listCategories);
router.get('/recent/list', controller.getRecent);
router.get('/related/list', controller.getRelated);
router.get('/:slug', controller.getBySlug);

module.exports = router;