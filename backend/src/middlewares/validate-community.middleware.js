const { HttpError } = require('../utils/http-error');

const COMMUNITY_CATEGORIES = new Set(['SETUPS', 'PROJECTS', 'MODDING', 'RETRO_TECH', 'SHOWCASE', 'DISCUSSION']);
const POST_STATUSES = new Set(['PUBLISHED', 'HIDDEN', 'REMOVED']);
const COMMENT_STATUSES = new Set(['VISIBLE', 'HIDDEN', 'REMOVED']);
const REPORT_TARGETS = new Set(['POST', 'COMMENT']);
const REPORT_STATUSES = new Set(['OPEN', 'REVIEWED', 'DISMISSED', 'ACTION_TAKEN']);

const readString = (value, field, min, max, optional = false) => {
  if ((value === undefined || value === null || value === '') && optional) return null;
  if (typeof value !== 'string') throw new HttpError(400, `O campo ${field} deve ser um texto.`);
  const t = value.trim().replace(/\r\n/g, '\n');
  if (!t && optional) return null;
  if (t.length < min || t.length > max) throw new HttpError(400, `O campo ${field} deve ter entre ${min} e ${max} caracteres.`);
  return t;
};
const readSlug = (value, field = 'slug') => {
  const slug = readString(value, field, 2, 140).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!slug) throw new HttpError(400, 'Slug inválido.');
  return slug;
};
const parseJsonField = (value, field) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') throw new HttpError(400, `O campo ${field} é inválido.`);
  try { return JSON.parse(value); } catch { throw new HttpError(400, `O campo ${field} deve ser JSON válido.`); }
};
const readIdArray = (value, field, max = 8) => {
  const arr = parseJsonField(value, field);
  if (arr === undefined) return undefined;
  if (!Array.isArray(arr)) throw new HttpError(400, `O campo ${field} deve ser array.`);
  return [...new Set(arr.map(Number).filter((n) => Number.isInteger(n) && n > 0))].slice(0, max);
};
const readStringArray = (arr, field, maxItems, min, max) => {
  if (!Array.isArray(arr)) throw new HttpError(400, `O campo ${field} deve ser array.`);
  return arr.slice(0, maxItems).map((v, i) => readString(v, `${field}[${i}]`, min, max)).filter(Boolean);
};
const readDetails = (raw, category) => {
  const value = parseJsonField(raw, 'details');
  if (value === undefined || value === null) return null;
  if (!['SETUPS', 'PROJECTS'].includes(category)) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, 'Os detalhes informados são inválidos.');
  const details = {
    components: readStringArray(value.components || [], 'details.components', 20, 1, 120),
    tools: readStringArray(value.tools || [], 'details.tools', 20, 1, 120),
    technologies: readStringArray(value.technologies || [], 'details.technologies', 20, 1, 80),
    steps: readStringArray(value.steps || [], 'details.steps', 20, 1, 500),
    challenges: readStringArray(value.challenges || [], 'details.challenges', 20, 1, 500),
  };
  return JSON.stringify(details);
};

const validatePostBody = (partial = false) => (req, _res, next) => {
  try {
    const b = req.body || {};
    const has = (k) => b[k] !== undefined;
    const data = {};
    if (!partial || has('title')) data.title = readString(b.title, 'title', 3, 140);
    if (!partial || has('slug')) data.slug = b.slug ? readSlug(b.slug) : (data.title ? readSlug(data.title) : undefined);
    if (!partial || has('description')) data.description = readString(b.description, 'description', 10, 6000);
    if (!partial || has('category')) {
      const category = readString(b.category, 'category', 3, 30).toUpperCase().replace(/[\s-]+/g, '_');
      if (!COMMUNITY_CATEGORIES.has(category)) throw new HttpError(400, 'Categoria inválida.');
      data.category = category;
    }
    if (has('details') || (!partial && ['SETUPS', 'PROJECTS'].includes(data.category))) data.detailsJson = readDetails(b.details, data.category);
    if (has('productIds')) data.productIds = readIdArray(b.productIds, 'productIds', 8) || [];
    if (has('removeImageUrls')) {
      const arr = parseJsonField(b.removeImageUrls, 'removeImageUrls');
      if (!Array.isArray(arr)) throw new HttpError(400, 'removeImageUrls deve ser array.');
      data.removeImageUrls = arr.map((u) => readString(u, 'removeImageUrls[]', 1, 500)).filter((u) => u.startsWith('/uploads/community/')).slice(0, 12);
    }
    if (!partial) for (const k of ['title','slug','description','category']) if (data[k] === undefined) throw new HttpError(400, `O campo ${k} é obrigatório.`);
    if (partial && Object.keys(data).length === 0 && !(req.files?.length)) throw new HttpError(400, 'Nenhum campo para atualizar.');
    req.validatedCommunityPost = data;
    next();
  } catch (e) { next(e); }
};

const validateCommentBody = (req, _res, next) => {
  try { req.validatedCommunityComment = { body: readString(req.body?.body, 'body', 1, 2000) }; next(); } catch (e) { next(e); }
};

const validateReportBody = (req, _res, next) => {
  try {
    const b = req.body || {};
    const targetType = readString(b.targetType, 'targetType', 4, 20).toUpperCase();
    if (!REPORT_TARGETS.has(targetType)) throw new HttpError(400, 'Tipo de denúncia inválido.');
    const reason = readString(b.reason, 'reason', 3, 80);
    const details = readString(b.details, 'details', 0, 1000, true);
    const postId = b.postId === undefined || b.postId === null || b.postId === '' ?null : Number(b.postId);
    const commentId = b.commentId === undefined || b.commentId === null || b.commentId === '' ?null : Number(b.commentId);
    if (targetType === 'POST' && (!Number.isInteger(postId) || postId <= 0)) throw new HttpError(400, 'postId inválido.');
    if (targetType === 'COMMENT' && (!Number.isInteger(commentId) || commentId <= 0)) throw new HttpError(400, 'commentId inválido.');
    req.validatedCommunityReport = { targetType, reason, details, postId: targetType === 'POST' ?postId : null, commentId: targetType === 'COMMENT' ?commentId : null };
    next();
  } catch (e) { next(e); }
};

const validateModerationPostBody = (req, _res, next) => {
  try {
    const status = readString(req.body?.status, 'status', 3, 20).toUpperCase();
    if (!POST_STATUSES.has(status)) throw new HttpError(400, 'Status inválido.');
    req.validatedCommunityModeration = { status, resolutionNote: readString(req.body?.resolutionNote, 'resolutionNote', 0, 500, true) };
    next();
  } catch (e) { next(e); }
};
const validateModerationCommentBody = (req, _res, next) => {
  try {
    const status = readString(req.body?.status, 'status', 3, 20).toUpperCase();
    if (!COMMENT_STATUSES.has(status)) throw new HttpError(400, 'Status inválido.');
    req.validatedCommunityCommentModeration = { status, resolutionNote: readString(req.body?.resolutionNote, 'resolutionNote', 0, 500, true) };
    next();
  } catch (e) { next(e); }
};
const validateReportStatusBody = (req, _res, next) => {
  try {
    const status = readString(req.body?.status, 'status', 3, 30).toUpperCase();
    if (!REPORT_STATUSES.has(status)) throw new HttpError(400, 'Status de denúncia inválido.');
    req.validatedCommunityReportStatus = { status, resolutionNote: readString(req.body?.resolutionNote, 'resolutionNote', 0, 500, true) };
    next();
  } catch (e) { next(e); }
};

module.exports = {
  COMMUNITY_CATEGORIES, POST_STATUSES, COMMENT_STATUSES, REPORT_TARGETS, REPORT_STATUSES,
  validatePostBody, validateCommentBody, validateReportBody,
  validateModerationPostBody, validateModerationCommentBody, validateReportStatusBody,
};

