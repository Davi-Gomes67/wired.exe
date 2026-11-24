const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

const EMAIL = `auth-teste-${Date.now()}@wired.local`;

after(async () => {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (user) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.address.deleteMany({ where: { userId: user.id } });
    await prisma.order.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
  await prisma.$disconnect();
});

test('register/login/me e proteção', async () => {
  const reg = await request(app).post('/api/auth/register').send({ name: 'Teste Auth', email: EMAIL, password: 'Senha1234' }).expect(201);
  assert.ok(reg.body.data.token);
  assert.equal(reg.body.data.user.email, EMAIL);
  assert.equal(reg.body.data.user.passwordHash, undefined);

  await request(app).post('/api/auth/register').send({ name: 'Teste', email: EMAIL, password: 'Senha1234' }).expect(409);
  await request(app).post('/api/auth/login').send({ email: EMAIL, password: 'errada' }).expect(401);

  const login = await request(app).post('/api/auth/login').send({ email: EMAIL, password: 'Senha1234' }).expect(200);
  const token = login.body.data.token;

  await request(app).get('/api/auth/me').expect(401);
  const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
  assert.equal(me.body.data.email, EMAIL);
});

test('reset de senha simulado', async () => {
  const forgot = await request(app).post('/api/auth/forgot-password').send({ email: EMAIL }).expect(200);
  assert.ok(forgot.body.data.resetToken);
  await request(app).post('/api/auth/reset-password').send({ token: forgot.body.data.resetToken, password: 'NovaSenha123' }).expect(200);
  await request(app).post('/api/auth/login').send({ email: EMAIL, password: 'NovaSenha123' }).expect(200);
});
