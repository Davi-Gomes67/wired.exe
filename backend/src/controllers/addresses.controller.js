const { listAddresses, createAddress, updateAddress, deleteAddress } = require('../services/addresses.service');

const list = async (req, res, next) => {
  try { res.json({ data: await listAddresses(req.user.id) }); }
  catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try { res.status(201).json({ data: await createAddress(req.user.id, req.validatedAddress) }); }
  catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: { message: 'ID inválido.' } });
    res.json({ data: await updateAddress(req.user.id, id, req.validatedAddress) });
  } catch (error) { next(error); }
};

const remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: { message: 'ID inválido.' } });
    await deleteAddress(req.user.id, id);
    res.status(204).send();
  } catch (error) { next(error); }
};

module.exports = { list, create, update, remove };
