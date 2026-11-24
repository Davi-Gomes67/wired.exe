const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { HttpError } = require('../utils/http-error');
const { signAuthToken } = require('../utils/jwt');
const { normalizeEmail, createResetToken, hashToken } = require('../utils/auth');

const SAFE_USER_SELECT = { id: true, name: true, email: true, phone: true, role: true, active: true, createdAt: true, updatedAt: true };
const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 1000 * 60 * 30;

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  active: user.active,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const issueAuth = (user) => ({ user: sanitizeUser(user), token: signAuthToken(user) });

const register = async ({ name, email, password, phone }) => {
  const normalizedEmail = normalizeEmail(email);
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } });
  if (existing) throw new HttpError(409, 'E-mail já cadastrado.');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, phone: phone || null, passwordHash },
    select: SAFE_USER_SELECT,
  });
  return issueAuth(user);
};

const login = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user || !user.active) throw new HttpError(401, 'Credenciais inválidas.');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Credenciais inválidas.');

  return issueAuth(user);
};

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: SAFE_USER_SELECT });
  if (!user) throw new HttpError(404, 'Usuário não encontrado.');
  return sanitizeUser(user);
};

const updateProfile = async (userId, data) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: SAFE_USER_SELECT,
  });
  return sanitizeUser(user);
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(404, 'Usuário não encontrado.');
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw new HttpError(400, 'Senha atual inválida.');

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
};

const requestPasswordReset = async ({ email }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true, email: true } });

  const generic = {
    message: 'Se o e-mail estiver cadastrado, um link de redefinição foi gerado (simulação).',
  };

  if (!user) return generic;

  const { rawToken, tokenHash } = createResetToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  // Simulação: nenhum e-mail real é enviado. O token é retornado para permitir teste do fluxo.
  return {
    ...generic,
    resetToken: rawToken,
    expiresAt,
  };
};

const resetPassword = async ({ token, password }) => {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    throw new HttpError(400, 'Token de redefinição inválido ou expirado.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null, id: { not: record.id } },
      data: { usedAt: new Date() },
    }),
  ]);
};

module.exports = { register, login, getMe, updateProfile, changePassword, requestPasswordReset, resetPassword, sanitizeUser };
