const { validateCartBody } = require('../middlewares/validate.middleware');
const { validateCart } = require('../services/orders.service');

const validate = async (req, res, next) => {
  try {
    const result = await validateCart(req.validatedCart);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { validate, validateCartBody };
