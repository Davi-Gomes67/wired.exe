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
    if (!token) throw new HttpError(401, 'Autentica?o necess?ria.');

    let payload;
    try {
      payload = verifyAuthToken(token);
    } catch {
      throw new HttpError(401, 'Token inv?lido ou expirado.');
    }

    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) throw new HttpError(401, 'Token inv?lido.');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, displayName: true, username: true, email: true, phone: true, role: true, active: true, publicMemberId: true, avatarUrl: true, createdAt: true, updatedAt: true },
    });
    if (!user || !user.active) throw new HttpError(401, 'Usu?rio n?o encontrado ou inativo.');

    req.user = user;
    req.authToken = token;
    next();
  } catch (error) {
    next(error);
  }
};

const optionalAuthenticate = async (req, _res, next) => {
  const token = getBearerToken(req);
  if (!token) return next();
  return requireAuth(req, _res, (err) => {
    if (err) { req.user = undefined; return next(); }
    return next();
  });
};

const requireAdmin = (req, _res, next) => {
  if (!req.user) return next(new HttpError(401, 'Autentica?o necess?ria.'));
  if (req.user.role !== 'ADMIN') return next(new HttpError(403, 'Acesso administrativo obrigat?rio.'));
  return next();
};

module.exports = { requireAuth, authenticate: requireAuth, optionalAuthenticate, requireAdmin };

