const { HttpError } = require('../utils/http-error');
const rootAccess = require('../services/root-access.service');
const activity = require('../services/admin/activity.service');

const wrap = (fn) => async (req, res, next) => { try { await fn(req, res, next); } catch (e) { next(e); } };

exports.getPublic = wrap(async (_req, res) => {
  res.json({ data: await rootAccess.getPublicConfig() });
});

exports.createRequest = wrap(async (req, res) => {
  const result = await rootAccess.createRequest({ user: req.user, body: req.body || {} });
  res.status(result.alreadyExists ?200 : 201).json({ data: result });
});

exports.listAdmin = wrap(async (_req, res) => {
  res.json({ data: await rootAccess.listAdmin() });
});

exports.updateStatus = wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID inválido.');
  const data = await rootAccess.updateStatus(id, req.body?.status);
  await activity.logActivity({ action: 'UPDATE_STATUS', entityType: 'ROOT_ACCESS', entityId: data.id, entityLabel: data.email, actor: req.user, metadata: { status: data.status } });
  res.json({ data });
});
