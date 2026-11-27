const prisma = require('../../config/prisma');
const { HttpError } = require('../../utils/http-error');
const { toPublicPost } = require('../community.service');

const postInclude = {
  author: { select: { id: true, name: true, displayName: true, username: true, email: true, avatarUrl: true, publicMemberId: true } },
  images: { orderBy: { sortOrder: 'asc' } },
  products: { orderBy: { sortOrder: 'asc' }, include: { product: { select: { id: true, name: true, slug: true } } } },
  _count: { select: { comments: true, likes: true, reports: true, saves: true } },
};

const listPosts = async (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
  const status = typeof query.status === 'string' ?query.status.toUpperCase() : '';
  const q = typeof query.q === 'string' ?query.q.trim() : '';
  const where = {};
  if (['PUBLISHED','HIDDEN','REMOVED'].includes(status)) where.status = status;
  if (q) where.OR = [{ title: { contains: q } }, { description: { contains: q } }, { author: { username: { contains: q } } }, { author: { email: { contains: q } } }, { author: { name: { contains: q } } }];
  const [total, items] = await Promise.all([
    prisma.communityPost.count({ where }),
    prisma.communityPost.findMany({ where, include: postInclude, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  return { items, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
};

const setPostStatus = async (id, status) => {
  const post = await prisma.communityPost.findUnique({ where: { id: Number(id) }, select: { id: true, title: true } });
  if (!post) throw new HttpError(404, 'Postagem não encontrada.');
  return prisma.communityPost.update({ where: { id: post.id }, data: { status }, include: postInclude });
};

const listComments = async (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
  const status = typeof query.status === 'string' ?query.status.toUpperCase() : '';
  const q = typeof query.q === 'string' ?query.q.trim() : '';
  const where = {};
  if (['VISIBLE','HIDDEN','REMOVED'].includes(status)) where.status = status;
  if (q) where.OR = [{ body: { contains: q } }, { author: { username: { contains: q } } }, { author: { email: { contains: q } } }, { post: { title: { contains: q } } }];
  const [total, items] = await Promise.all([
    prisma.communityComment.count({ where }),
    prisma.communityComment.findMany({ where, include: { author: { select: { id: true, name: true, displayName: true, username: true, email: true } }, post: { select: { id: true, slug: true, title: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  return { items, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
};

const setCommentStatus = async (id, status) => {
  const comment = await prisma.communityComment.findUnique({ where: { id: Number(id) }, select: { id: true } });
  if (!comment) throw new HttpError(404, 'Comentário não encontrado.');
  return prisma.communityComment.update({ where: { id: comment.id }, data: { status }, include: { author: { select: { id: true, name: true, displayName: true, username: true, email: true } }, post: { select: { id: true, slug: true, title: true } } } });
};

const listReports = async (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(query.pageSize) || 20));
  const status = typeof query.status === 'string' ?query.status.toUpperCase() : '';
  const where = {};
  if (['OPEN','REVIEWED','DISMISSED','ACTION_TAKEN'].includes(status)) where.status = status;
  const [total, items] = await Promise.all([
    prisma.communityReport.count({ where }),
    prisma.communityReport.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, displayName: true, username: true, email: true } },
        reviewer: { select: { id: true, name: true, username: true, email: true } },
        post: { select: { id: true, slug: true, title: true, status: true, author: { select: { username: true, displayName: true, name: true } } } },
        comment: { select: { id: true, body: true, status: true, postId: true, author: { select: { username: true, displayName: true, name: true } }, post: { select: { slug: true, title: true } } } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize, take: pageSize,
    }),
  ]);
  return { items, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
};

const updateReport = async ({ id, status, reviewerId, resolutionNote }) => {
  const report = await prisma.communityReport.findUnique({ where: { id: Number(id) }, select: { id: true } });
  if (!report) throw new HttpError(404, 'Denúncia não encontrada.');
  return prisma.communityReport.update({ where: { id: report.id }, data: { status, reviewedById: reviewerId, reviewedAt: new Date(), resolutionNote: resolutionNote || null } });
};

module.exports = { listPosts, setPostStatus, listComments, setCommentStatus, listReports, updateReport };
