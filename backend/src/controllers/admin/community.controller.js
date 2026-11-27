const { HttpError } = require('../../utils/http-error');
const service = require('../../services/admin/community.service');
const activity = require('../../services/admin/activity.service');

const wrap = (fn) => async (req, res, next) => { try { await fn(req, res, next); } catch (e) { next(e); } };
const idParam = (req) => { const id = Number(req.params.id); if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'ID inválido.'); return id; };

exports.listPosts = wrap(async (req, res) => res.json(await service.listPosts(req.query)));
exports.updatePostStatus = wrap(async (req, res) => {
  const data = await service.setPostStatus(idParam(req), req.validatedCommunityModeration.status);
  await activity.logActivity({ action: 'MODERATE', entityType: 'COMMUNITY_POST', entityId: data.id, entityLabel: data.title, actor: req.user, metadata: { status: data.status, note: req.validatedCommunityModeration.resolutionNote } });
  res.json({ data });
});
exports.listComments = wrap(async (req, res) => res.json(await service.listComments(req.query)));
exports.updateCommentStatus = wrap(async (req, res) => {
  const data = await service.setCommentStatus(idParam(req), req.validatedCommunityCommentModeration.status);
  await activity.logActivity({ action: 'MODERATE', entityType: 'COMMUNITY_COMMENT', entityId: data.id, entityLabel: data.post?.title || String(data.postId), actor: req.user, metadata: { status: data.status, note: req.validatedCommunityCommentModeration.resolutionNote } });
  res.json({ data });
});
exports.listReports = wrap(async (req, res) => res.json(await service.listReports(req.query)));
exports.updateReport = wrap(async (req, res) => {
  const data = await service.updateReport({ id: idParam(req), status: req.validatedCommunityReportStatus.status, reviewerId: req.user.id, resolutionNote: req.validatedCommunityReportStatus.resolutionNote });
  await activity.logActivity({ action: 'REVIEW_REPORT', entityType: 'COMMUNITY_REPORT', entityId: data.id, actor: req.user, metadata: { status: data.status, note: req.validatedCommunityReportStatus.resolutionNote } });
  res.json({ data });
});
