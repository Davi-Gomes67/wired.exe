const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const prisma =
  global.__wiredPrisma ||
  new PrismaClient({
    log: env.nodeEnv === 'development' ? ['error', 'warn'] : ['error'],
  });

if (env.nodeEnv !== 'production') {
  global.__wiredPrisma = prisma;
}

module.exports = prisma;
