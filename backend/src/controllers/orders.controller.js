const { createOrder, findOrderByCode, listOrdersByUser } = require('../services/orders.service');

const create = async (req, res, next) => {
  try {
    const order = await createOrder(req.validatedOrder, req.user);
    res.status(201).json({ data: order });
  } catch (error) { next(error); }
};

const getByCode = async (req, res, next) => {
  try {
    const code = String(req.params.code || '').trim();
    if (!code) return res.status(400).json({ error: { message: 'Código de pedido inválido.' } });
    const order = await findOrderByCode(code, req.user.id);
    res.json({ data: order });
  } catch (error) { next(error); }
};

const listMine = async (req, res, next) => {
  try {
    const orders = await listOrdersByUser(req.user.id);
    res.json({ data: orders });
  } catch (error) { next(error); }
};

module.exports = { create, getByCode, listMine };
