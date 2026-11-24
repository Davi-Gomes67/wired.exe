const { Router } = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const { validateAddressBody } = require('../middlewares/validate.middleware');
const addresses = require('../controllers/addresses.controller');

const router = Router();

router.use(requireAuth);
router.get('/', addresses.list);
router.post('/', validateAddressBody(false), addresses.create);
router.put('/:id', validateAddressBody(true), addresses.update);
router.delete('/:id', addresses.remove);

module.exports = router;
