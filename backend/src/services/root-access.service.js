const prisma = require('../config/prisma');
const { HttpError } = require('../utils/http-error');
const { getPublicSettings, getSettings } = require('./admin/settings.service');
const { unlock } = require('./achievements.service');

const STATUSES = new Set(['PENDING', 'ACTIVE', 'CANCELLED', 'EXPIRED']);
const SOURCES = new Set(['PAGE', 'CART', 'CHECKOUT', 'POST_PURCHASE']);

const getPublicConfig = async () => {
  const settings = await getPublicSettings();
  return settings.rootAccess;
};

const createRequest = async ({ user, body }) => {
  const settings = await getSettings();
  if (!settings.rootAccessEnabled) throw new HttpError(400, 'O ROOT ACCESS não está disponível no momento.');

  const acceptTerms = body?.acceptTerms === true;
  if (!acceptTerms) throw new HttpError(400, 'É necessário aceitar os termos para solicitar o ROOT ACCESS.');

  const source = String(body?.source || 'PAGE').toUpperCase();
  if (!SOURCES.has(source)) throw new HttpError(400, 'Origem inválida.');

  const email = String(user?.email || body?.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new HttpError(400, 'E-mail inválido.');

  const orderCode = typeof body?.orderCode === 'string' && body.orderCode.trim() ? body.orderCode.trim() : null;
  if (orderCode) {
    const order = await prisma.order.findFirst({ where: { orderCode, userId: user.id } });
    if (!order) throw new HttpError(404, 'Pedido não encontrado para vincular à solicitação.');
  }

  const existing = await prisma.rootAccessSubscription.findFirst({
    where: {
      userId: user.id,
      status: { in: ['PENDING', 'ACTIVE'] },
    },
    orderBy: { createdAt: 'desc' },
  });
  if (existing) {
    return { subscription: existing, alreadyExists: true };
  }

  const subscription = await prisma.rootAccessSubscription.create({
    data: {
      userId: user.id,
      email,
      status: 'PENDING',
      planCode: 'root_access',
      priceCents: Number(settings.rootAccessPriceCents) || 4990,
      acceptedTermsAt: new Date(),
      source,
      orderCode,
    },
  });

  return { subscription, alreadyExists: false };
};

const listAdmin = async () => prisma.rootAccessSubscription.findMany({
  orderBy: { createdAt: 'desc' },
  include: { user: { select: { id: true, name: true, email: true } } },
  take: 100,
});

const updateStatus = async (id, status) => {
  const normalized = String(status || '').toUpperCase();
  if (!STATUSES.has(normalized)) throw new HttpError(400, 'Status inválido.');
  const existing = await prisma.rootAccessSubscription.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, 'Assinatura não encontrada.');
  const data = { status: normalized };
  if (normalized === 'CANCELLED') data.cancelledAt = new Date();
  if (normalized === 'ACTIVE') { data.cancelledAt = null; data.expiresAt = null; }
  const updated = await prisma.rootAccessSubscription.update({ where: { id }, data, include: { user: { select: { id: true, name: true, email: true } } } });
  if (normalized === 'ACTIVE' && updated.userId) await unlock(updated.userId, 'ROOT_MEMBER', { subscriptionId: updated.id }).catch(() => {});
  return updated;
};

module.exports = { getPublicConfig, createRequest, listAdmin, updateStatus, STATUSES, SOURCES };

