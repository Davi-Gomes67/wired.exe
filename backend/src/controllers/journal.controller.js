const journal = require('../services/journal.service');

const wrap = (fn) => async (req, res, next) => { try { await fn(req, res, next); } catch (e) { next(e); } };

exports.list = wrap(async (req, res) => res.json(await journal.listPublished(req.query)));
exports.listCategories = wrap(async (_req, res) => res.json({ data: await journal.listCategories() }));
exports.getRecent = wrap(async (req, res) => res.json({ data: await journal.getRecent(req.query.limit) }));
exports.getRelated = wrap(async (req, res) => res.json({ data: await journal.getRelated(req.query) }));
exports.getBySlug = wrap(async (req, res) => res.json({ data: await journal.getPublishedBySlug(req.params.slug) }));