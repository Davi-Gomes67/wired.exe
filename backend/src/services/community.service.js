const prisma = require('../config/prisma');
const { HttpError } = require('../utils/http-error');
const { COMMUNITY_CATEGORIES } = require('../middlewares/validate-community.middleware');

const publicAuthor = { select: { id: true, name: true, displayName: true, username: true, avatarUrl: true, publicMemberId: true, createdAt: true } };
const productSelect = { select: { id: true, name: true, slug: true, imageUrl: true, priceCents: true, stock: true, category: { select: { name: true, slug: true } } } };

const basePostInclude = {
  author: publicAuthor,
  images: { orderBy: { sortOrder: 'asc' } },
  products: { orderBy: { sortOrder: 'asc' }, include: { product: productSelect } },
  _count: { select: { comments: { where: { status: 'VISIBLE' } }, likes: true } },
};

const parseDetails = (raw) => { try { return raw ? JSON.parse(raw) : null; } catch { return null; } };
const toPublicPost = (post, viewerId) => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  description: post.description,
  category: post.category,
  status: post.status,
  details: parseDetails(post.detailsJson),
  author: post.author ?{
    username: post.author.username,
    displayName: post.author.displayName || post.author.name,
    avatarUrl: post.author.avatarUrl,
    publicMemberId: post.author.publicMemberId,
    createdAt: post.author.createdAt,
  } : null,
  images: (post.images || []).map((i) => ({ id: i.id, url: i.url, sortOrder: i.sortOrder })),
  products: (post.products || []).map((p) => p.product).filter(Boolean),
  likesCount: post._count?.likes ?? 0,
  commentsCount: post._count?.comments ?? 0,
  likedByViewer: viewerId ?(post.likes || []).some((l) => l.userId === viewerId) : false,
  savedByViewer: viewerId ?(post.saves || []).some((s) => s.userId === viewerId) : false,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

const makeSlug = async (title, excludeId) => {
  const base = String(title || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120) || 'post';
  let slug = base; let n = 2;
  while (await prisma.communityPost.findFirst({ where: { slug, ...(excludeId ?{ id: { not: excludeId } } : {}) }, select: { id: true } })) slug = `${base}-${n++}`;
  return slug;
};

const visibleWhere = (viewerId) => viewerId ?{ OR: [{ status: 'PUBLISHED' }, { authorId: viewerId, status: { not: 'REMOVED' } }] } : { status: 'PUBLISHED' };
const canEdit = (post, user) => user && (user.role === 'ADMIN' || post.authorId === user.id);

const includeForViewer = (viewerId) => ({
  ...basePostInclude,
  likes: viewerId ?{ where: { userId: viewerId }, select: { userId: true } } : false,
  saves: viewerId ?{ where: { userId: viewerId }, select: { userId: true } } : false,
});

const listPosts = async ({ query = {}, viewerId } = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(24, Math.max(1, Number(query.pageSize) || 12));
  const category = typeof query.category === 'string' ?query.category.toUpperCase().replace(/[\s-]+/g, '_') : '';
  const q = typeof query.q === 'string' ?query.q.trim() : '';
  const authorUsername = typeof query.author === 'string' ?query.author.trim().toLowerCase() : '';
  const sort = query.sort === 'top' ?'top' : 'latest';
  const where = { AND: [visibleWhere(viewerId)] };
  if (COMMUNITY_CATEGORIES.has(category)) where.AND.push({ category });
  if (authorUsername) where.AND.push({ author: { username: authorUsername } });
  if (q) where.AND.push({ OR: [{ title: { contains: q } }, { description: { contains: q } }, { author: { username: { contains: q } } }, { author: { displayName: { contains: q } } }, { author: { name: { contains: q } } }] });
  const [total, items] = await Promise.all([
    prisma.communityPost.count({ where }),
    prisma.communityPost.findMany({ where, include: includeForViewer(viewerId), orderBy: sort === 'top' ?[{ likes: { _count: 'desc' } }, { createdAt: 'desc' }] : [{ createdAt: 'desc' }], skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  return { items: items.map((p) => toPublicPost(p, viewerId)), meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
};

const getPostBySlug = async (slug, viewerId) => {
  const post = await prisma.communityPost.findFirst({ where: { slug, ...visibleWhere(viewerId) }, include: includeForViewer(viewerId) });
  if (!post) throw new HttpError(404, 'Postagem não encontrada.');
  return toPublicPost(post, viewerId);
};

const ensureAuthorUsername = (user) => { if (!user?.username) throw new HttpError(400, 'Defina um nome de usuário nas configurações da conta antes de publicar na comunidade.'); };

const createPost = async ({ user, data, files = [] }) => {
  ensureAuthorUsername(user);
  const slug = await makeSlug(data.slug || data.title);
  const imageUrls = files.map((f) => `/uploads/community/${f.filename}`).slice(0, 6);
  const post = await prisma.communityPost.create({
    data: {
      authorId: user.id, title: data.title, slug, description: data.description, category: data.category, status: 'PUBLISHED', detailsJson: data.detailsJson || null,
      images: { create: imageUrls.map((url, i) => ({ url, sortOrder: i })) },
      products: data.productIds?.length ?{ create: data.productIds.map((productId, i) => ({ productId, sortOrder: i })) } : undefined,
    },
    include: includeForViewer(user.id),
  });
  return toPublicPost(post, user.id);
};

const updatePost = async ({ user, slug, data, files = [] }) => {
  const existing = await prisma.communityPost.findUnique({ where: { slug }, include: { images: true, author: publicAuthor } });
  if (!existing) throw new HttpError(404, 'Postagem não encontrada.');
  if (!canEdit(existing, user)) throw new HttpError(403, 'Sem permissão para editar esta postagem.');
  if (user.role !== 'ADMIN' && existing.status === 'REMOVED') throw new HttpError(403, 'Postagem removida não pode ser editada.');
  const nextSlug = data.slug ?await makeSlug(data.slug, existing.id) : existing.slug;
  const removeSet = new Set(data.removeImageUrls || []);
  const remaining = existing.images.filter((i) => !removeSet.has(i.url)).sort((a, b) => a.sortOrder - b.sortOrder);
  const newUrls = files.map((f) => `/uploads/community/${f.filename}`);
  const finalImages = [...remaining.map((i) => i.url), ...newUrls].slice(0, 6);
  await prisma.$transaction(async (tx) => {
    await tx.communityPost.update({ where: { id: existing.id }, data: { title: data.title ?? existing.title, slug: nextSlug, description: data.description ?? existing.description, category: data.category ?? existing.category, detailsJson: data.detailsJson !== undefined ? data.detailsJson : existing.detailsJson } });
    if (data.removeImageUrls || files.length) {
      await tx.communityPostImage.deleteMany({ where: { postId: existing.id } });
      if (finalImages.length) await tx.communityPostImage.createMany({ data: finalImages.map((url, i) => ({ postId: existing.id, url, sortOrder: i })) });
    }
    if (data.productIds !== undefined) {
      await tx.communityPostProduct.deleteMany({ where: { postId: existing.id } });
      if (data.productIds.length) await tx.communityPostProduct.createMany({ data: data.productIds.map((productId, i) => ({ postId: existing.id, productId, sortOrder: i })) });
    }
  });
  return getPostBySlug(nextSlug, user.id);
};

const removePost = async ({ user, slug }) => {
  const existing = await prisma.communityPost.findUnique({ where: { slug }, select: { id: true, authorId: true, status: true } });
  if (!existing) throw new HttpError(404, 'Postagem não encontrada.');
  if (!canEdit(existing, user)) throw new HttpError(403, 'Sem permissão para remover esta postagem.');
  await prisma.communityPost.update({ where: { id: existing.id }, data: { status: 'REMOVED' } });
  return { ok: true };
};

const listComments = async ({ slug, viewerId, page = 1, pageSize = 20 }) => {
  const post = await prisma.communityPost.findFirst({ where: { slug, ...visibleWhere(viewerId) }, select: { id: true } });
  if (!post) throw new HttpError(404, 'Postagem não encontrada.');
  const take = Math.min(50, Math.max(1, Number(pageSize) || 20));
  const skip = (Math.max(1, Number(page) || 1) - 1) * take;
  const where = { postId: post.id, status: 'VISIBLE' };
  const [total, items] = await Promise.all([
    prisma.communityComment.count({ where }),
    prisma.communityComment.findMany({ where, include: { author: publicAuthor }, orderBy: { createdAt: 'asc' }, skip, take }),
  ]);
  return {
    items: items.map((c) => ({ id: c.id, body: c.body, status: c.status, createdAt: c.createdAt, author: { username: c.author.username, displayName: c.author.displayName || c.author.name, avatarUrl: c.author.avatarUrl, publicMemberId: c.author.publicMemberId } })),
    meta: { page: Math.max(1, Number(page) || 1), pageSize: take, total, totalPages: Math.max(1, Math.ceil(total / take)) },
  };
};

const addComment = async ({ user, slug, body }) => {
  const post = await prisma.communityPost.findFirst({ where: { slug, status: 'PUBLISHED' }, select: { id: true } });
  if (!post) throw new HttpError(404, 'Postagem não encontrada.');
  const comment = await prisma.communityComment.create({ data: { postId: post.id, authorId: user.id, body }, include: { author: publicAuthor } });
  return { id: comment.id, body: comment.body, status: comment.status, createdAt: comment.createdAt, author: { username: comment.author.username, displayName: comment.author.displayName || comment.author.name, avatarUrl: comment.author.avatarUrl, publicMemberId: comment.author.publicMemberId } };
};

const removeComment = async ({ user, commentId }) => {
  const comment = await prisma.communityComment.findUnique({ where: { id: Number(commentId) }, select: { id: true, authorId: true, status: true } });
  if (!comment) throw new HttpError(404, 'Comentário não encontrado.');
  if (!(user.role === 'ADMIN' || comment.authorId === user.id)) throw new HttpError(403, 'Sem permissão.');
  await prisma.communityComment.update({ where: { id: comment.id }, data: { status: 'REMOVED' } });
  return { ok: true };
};

const toggleLike = async ({ user, slug }) => {
  const post = await prisma.communityPost.findFirst({ where: { slug, status: 'PUBLISHED' }, select: { id: true } });
  if (!post) throw new HttpError(404, 'Postagem não encontrada.');
  const existing = await prisma.communityPostLike.findUnique({ where: { postId_userId: { postId: post.id, userId: user.id } }, select: { id: true } });
  if (existing) await prisma.communityPostLike.delete({ where: { id: existing.id } });
  else await prisma.communityPostLike.create({ data: { postId: post.id, userId: user.id } });
  const likesCount = await prisma.communityPostLike.count({ where: { postId: post.id } });
  return { liked: !existing, likesCount };
};

const toggleSave = async ({ user, slug }) => {
  const post = await prisma.communityPost.findFirst({ where: { slug, status: 'PUBLISHED' }, select: { id: true } });
  if (!post) throw new HttpError(404, 'Postagem não encontrada.');
  const existing = await prisma.communitySavedPost.findUnique({ where: { postId_userId: { postId: post.id, userId: user.id } }, select: { id: true } });
  if (existing) await prisma.communitySavedPost.delete({ where: { id: existing.id } });
  else await prisma.communitySavedPost.create({ data: { postId: post.id, userId: user.id } });
  return { saved: !existing };
};

const listSaved = async ({ userId, page = 1, pageSize = 12 }) => {
  const take = Math.min(24, Math.max(1, Number(pageSize) || 12));
  const skip = (Math.max(1, Number(page) || 1) - 1) * take;
  const where = { userId, post: { status: 'PUBLISHED' } };
  const [total, rows] = await Promise.all([
    prisma.communitySavedPost.count({ where }),
    prisma.communitySavedPost.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take, include: { post: { include: includeForViewer(userId) } } }),
  ]);
  return { items: rows.map((r) => toPublicPost(r.post, userId)), meta: { page: Math.max(1, Number(page) || 1), pageSize: take, total, totalPages: Math.max(1, Math.ceil(total / take)) } };
};

const reportTarget = async ({ user, data }) => {
  if (data.targetType === 'POST') {
    const post = await prisma.communityPost.findUnique({ where: { id: data.postId }, select: { id: true, status: true } });
    if (!post || post.status === 'REMOVED') throw new HttpError(404, 'Postagem não encontrada.');
  } else {
    const comment = await prisma.communityComment.findUnique({ where: { id: data.commentId }, select: { id: true, status: true } });
    if (!comment || comment.status === 'REMOVED') throw new HttpError(404, 'Comentário não encontrado.');
  }
  const recent = await prisma.communityReport.findFirst({ where: { reporterId: user.id, targetType: data.targetType, postId: data.postId, commentId: data.commentId, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, select: { id: true } });
  if (recent) throw new HttpError(429, 'Você já enviou uma denúncia recente para este conteúdo.');
  await prisma.communityReport.create({ data: { ...data, reporterId: user.id, status: 'OPEN' } });
  return { ok: true };
};

const getPublicProfile = async ({ username, viewerId, page = 1, pageSize = 12 }) => {
  const u = String(username || '').trim().toLowerCase();
  const user = await prisma.user.findFirst({ where: { username: u, active: true }, select: { id: true, name: true, displayName: true, username: true, avatarUrl: true, publicMemberId: true, createdAt: true } });
  if (!user) throw new HttpError(404, 'Perfil não encontrado.');
  const where = { authorId: user.id, status: 'PUBLISHED' };
  const take = Math.min(24, Math.max(1, Number(pageSize) || 12));
  const skip = (Math.max(1, Number(page) || 1) - 1) * take;
  const [total, items] = await Promise.all([
    prisma.communityPost.count({ where }),
    prisma.communityPost.findMany({ where, include: includeForViewer(viewerId), orderBy: { createdAt: 'desc' }, skip, take }),
  ]);
  return {
    profile: { username: user.username, displayName: user.displayName || user.name, avatarUrl: user.avatarUrl, publicMemberId: user.publicMemberId, createdAt: user.createdAt },
    posts: { items: items.map((p) => toPublicPost(p, viewerId)), meta: { page: Math.max(1, Number(page) || 1), pageSize: take, total, totalPages: Math.max(1, Math.ceil(total / take)) } },
  };
};

module.exports = {
  COMMUNITY_CATEGORIES: [...COMMUNITY_CATEGORIES],
  listPosts, getPostBySlug, createPost, updatePost, removePost,
  listComments, addComment, removeComment, toggleLike, toggleSave, listSaved, reportTarget, getPublicProfile,
  toPublicPost,
};

