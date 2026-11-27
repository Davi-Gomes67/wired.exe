const community = require('../services/community.service');
const { validateImageFiles } = require('../middlewares/upload.middleware');
const { HttpError } = require('../utils/http-error');

const wrap = (fn) => async (req, res, next) => { try { await fn(req, res, next); } catch (e) { next(e); } };
const viewerId = (req) => req.user?.id || null;

exports.list = wrap(async (req, res) => res.json(await community.listPosts({ query: req.query, viewerId: viewerId(req) })));
exports.getBySlug = wrap(async (req, res) => res.json({ data: await community.getPostBySlug(req.params.slug, viewerId(req)) }));
exports.getProfile = wrap(async (req, res) => res.json({ data: await community.getPublicProfile({ username: req.params.username, viewerId: viewerId(req), page: req.query.page, pageSize: req.query.pageSize }) }));

exports.create = wrap(async (req, res) => {
  validateImageFiles(req.files || []);
  if ((req.files || []).length > 6) throw new HttpError(400, 'Máximo de 6 imagens por postagem.');
  const data = await community.createPost({ user: req.user, data: req.validatedCommunityPost, files: req.files || [] });
  res.status(201).json({ data });
});

exports.update = wrap(async (req, res) => {
  validateImageFiles(req.files || []);
  const data = await community.updatePost({ user: req.user, slug: req.params.slug, data: req.validatedCommunityPost, files: req.files || [] });
  res.json({ data });
});

exports.remove = wrap(async (req, res) => res.json({ data: await community.removePost({ user: req.user, slug: req.params.slug }) }));
exports.listComments = wrap(async (req, res) => res.json(await community.listComments({ slug: req.params.slug, viewerId: viewerId(req), page: req.query.page, pageSize: req.query.pageSize })));
exports.addComment = wrap(async (req, res) => res.status(201).json({ data: await community.addComment({ user: req.user, slug: req.params.slug, body: req.validatedCommunityComment.body }) }));
exports.removeComment = wrap(async (req, res) => res.json({ data: await community.removeComment({ user: req.user, commentId: req.params.commentId }) }));
exports.toggleLike = wrap(async (req, res) => res.json({ data: await community.toggleLike({ user: req.user, slug: req.params.slug }) }));
exports.toggleSave = wrap(async (req, res) => res.json({ data: await community.toggleSave({ user: req.user, slug: req.params.slug }) }));
exports.listSaved = wrap(async (req, res) => res.json(await community.listSaved({ userId: req.user.id, page: req.query.page, pageSize: req.query.pageSize })));
exports.report = wrap(async (req, res) => res.status(201).json({ data: await community.reportTarget({ user: req.user, data: req.validatedCommunityReport }) }));

