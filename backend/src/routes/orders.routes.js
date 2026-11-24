const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const { validateOrderBody } = require('../middlewares/validate.middleware');
const { create, getByCode, listMine } = require('../controllers/orders.controller');

const router = Router();

router.use(requireAuth);
router.post('/', validateOrderBody, create);
router.get('/', listMine);
router.get('/:code', getByCode);

module.exports = router;
