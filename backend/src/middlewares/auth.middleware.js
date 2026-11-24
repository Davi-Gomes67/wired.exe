const prisma = require('../config/prisma');
const { HttpError } = require('../utils/http-error');
const { verifyAuthToken } = require('../utils/jwt');

const getBearerToken = (req) => {
  const header = String(req.headers.authorization || '');
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token || null;
};

const requireAuth = async (req, _res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) throw new HttpError(401, 'Autenticação necessária.');

    let payload;
    try {
      payload = verifyAuthToken(token);
    } catch {
      throw new HttpError(401, 'Token inválido ou expirado.');
    }

    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) throw new HttpError(401, 'Token inválido.');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, active: true, createdAt: true, updatedAt: true },
    });
    if (!user || !user.active) throw new HttpError(401, 'Usuário não encontrado ou inativo.');

    req.user = user;
    req.authToken = token;
    next();
  } catch (error) {
    next(error);
  }
};

const requireAdmin = (req, _res, next) => {
  if (!req.user) return next(new HttpError(401, 'Autenticação necessária.'));
  if (req.user.role !== 'ADMIN') return next(new HttpError(403, 'Acesso administrativo obrigatório.'));
  return next();
};

module.exports = { requireAuth, requireAdmin };
