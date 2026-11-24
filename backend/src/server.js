const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');
const { ensureAdminUser } = require('./utils/bootstrap-admin');

const server = app.listen(env.port, async () => {
  try { await ensureAdminUser(); } catch (e) { console.error('[WIRED.exe] Falha ao bootstrap admin:', e.message); }
  console.log(`[WIRED.exe] API pronta em http://localhost:${env.port}`);
});

const shutdown = (signal) => {
  console.log(`[WIRED.exe] Encerrando API (${signal})...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
