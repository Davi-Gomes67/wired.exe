const crypto = require('node:crypto');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

const createResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  return { rawToken, tokenHash: hashToken(rawToken) };
};

module.exports = { normalizeEmail, hashToken, createResetToken };
