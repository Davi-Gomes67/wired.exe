const { Router } = require('express');
const { validate, validateCartBody } = require('../controllers/cart.controller');

const router = Router();

router.post('/validate', validateCartBody, validate);

module.exports = router;
