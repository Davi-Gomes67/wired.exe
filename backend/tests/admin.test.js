const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

const adminEmail = `admin-test-${Date.now()}@wired.local`;
const customerEmail = `customer-test-${Date.now()}@wired.local`;

before(async () => {
  const hash = await bcrypt.hash('Senha1234', 10);
  await prisma.user.create({ data: { name: 'Admin Test', email: adminEmail, passwordHash: hash, role: 'ADMIN', active: true } });
  await prisma.user.create({ data: { name: 'Customer Test', email: customerEmail, passwordHash: hash, role: 'CUSTOMER', active: true } });
});

after(async () => {
  await prisma.user.deleteMany({ where: { email: { in: [adminEmail, customerEmail] } } });
  await prisma.$disconnect();
});

async function login(email) {
  const res = await request(app).post('/api/auth/login').send({ email, password: 'Senha1234' }).expect(200);
  return res.body.data.token;
}

test('admin routes exigem auth e role ADMIN', async () => {
  await request(app).get('/api/admin/dashboard').expect(401);
  const customerToken = await login(customerEmail);
  await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${customerToken}`).expect(403);
  const adminToken = await login(adminEmail);
  const dash = await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${adminToken}`).expect(200);
  assert.equal(typeof dash.body.data.kpis.totalRevenueCents, 'number');
  assert.equal(typeof dash.body.data.kpis.totalCategories, 'number');
  assert.equal(Array.isArray(dash.body.data.categoryDistribution), true);
  assert.equal(Array.isArray(dash.body.data.recentActivities), true);
  const act = await request(app).get('/api/admin/activities?limit=5').set('Authorization', `Bearer ${adminToken}`).expect(200);
  assert.equal(Array.isArray(act.body.data), true);
});

test('admin CRUD categoria e estoque', async () => {
  const adminToken = await login(adminEmail);
  const cat = await request(app).post('/api/admin/categories').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Cat Admin Test', slug: `cat-admin-${Date.now()}` }).expect(201);
  const product = await request(app).post('/api/admin/products').set('Authorization', `Bearer ${adminToken}`).send({
    name: 'Produto Admin Test', slug: `produto-admin-${Date.now()}`, description: 'Descrição válida para produto admin.', categoryId: cat.body.data.id, priceCents: 12345, stock: 10
  }).expect(201);
  const stock = await request(app).patch(`/api/admin/products/${product.body.data.id}/stock`).set('Authorization', `Bearer ${adminToken}`).send({ stock: 7 }).expect(200);
  assert.equal(stock.body.data.stock, 7);
  await request(app).delete(`/api/admin/products/${product.body.data.id}`).set('Authorization', `Bearer ${adminToken}`).expect(204);
  await request(app).delete(`/api/admin/categories/${cat.body.data.id}`).set('Authorization', `Bearer ${adminToken}`).expect(204);
});

test('admin valida compareAtCents e upload inválido', async () => {
  const adminToken = await login(adminEmail);
  const category = await prisma.category.findFirst();
  const bad = await request(app).post('/api/admin/products').set('Authorization', `Bearer ${adminToken}`).send({
    name: 'Produto inválido', description: 'Descrição válida para produto admin.', categoryId: category.id, priceCents: 1000, compareAtCents: 900, stock: 1
  }).expect(400);
  assert.match(bad.body.error.message, /compareAtCents/);

  const product = await prisma.product.findFirst({ select: { id: true } });
  await request(app).post(`/api/admin/products/${product.id}/images`).set('Authorization', `Bearer ${adminToken}`).attach('images', Buffer.from('not-an-image'), { filename: 'fake.png', contentType: 'image/png' }).expect(400);
});

test('admin gerencia pedidos e clientes', async () => {
  const adminToken = await login(adminEmail);
  const order = await prisma.order.findFirst({ orderBy: { createdAt: 'desc' } });
  if (order) {
    const updated = await request(app).patch(`/api/admin/orders/${order.id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'CONFIRMED', paymentStatus: 'PAID' }).expect(200);
    assert.equal(updated.body.data.status, 'CONFIRMED');
  }
  const customer = await prisma.user.findFirst({ where: { email: customerEmail } });
  const detail = await request(app).get(`/api/admin/customers/${customer.id}`).set('Authorization', `Bearer ${adminToken}`).expect(200);
  assert.equal(detail.body.data.email, customerEmail);
  const status = await request(app).patch(`/api/admin/customers/${customer.id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ active: false }).expect(200);
  assert.equal(status.body.data.active, false);
  await request(app).patch(`/api/admin/customers/${customer.id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ active: true }).expect(200);
});
