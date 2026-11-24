const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const nodeEnv = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || (nodeEnv === 'production' ? '' : 'wired-dev-secret-change-me');

if (!jwtSecret) {
  throw new Error('JWT_SECRET é obrigatório em produção.');
}

module.exports = {
  port: toInt(process.env.PORT, 4000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv,
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  adminName: process.env.ADMIN_NAME || 'Administrador WIRED',
};
