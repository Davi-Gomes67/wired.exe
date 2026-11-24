const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const env = require('../config/env');

const ensureAdminUser = async () => {
  if (!env.adminEmail || !env.adminPassword) return;
  const email = env.adminEmail.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const data = { role: 'ADMIN', active: true, name: env.adminName || existing.name };
    if (process.env.ADMIN_RESET_PASSWORD === 'true') {
      data.passwordHash = await bcrypt.hash(env.adminPassword, 10);
    }
    await prisma.user.update({ where: { id: existing.id }, data });
    return;
  }
  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  await prisma.user.create({ data: { name: env.adminName || 'Administrador', email, passwordHash, role: 'ADMIN', active: true } });
};

module.exports = { ensureAdminUser };
