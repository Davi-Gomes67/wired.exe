const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

const EMAIL = `pedido-teste-${Date.now()}@wired.local`;
const OTHER_EMAIL = `pedido-outro-${Date.now()}@wired.local`;
let productId;
let token;
let otherToken;

const basePayload = (overrides = {}) => ({
  customerPhone: '(11) 99999-9999',
  postalCode: '01310-100',
  addressLine1: 'Av. Paulista, 1000',
  addressLine2: 'Apto 10',
  district: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP',
  paymentMethod: 'PIX_SIMULADO',
  items: [{ productId, quantity: 2 }],
  ...overrides,
});

before(async () => {
  const category = await prisma.category.upsert({
    where: { slug: 'categoria-teste-api' },
    update: {},
    create: { name: 'Categoria Teste API', slug: 'categoria-teste-api' },
  });

  const product = await prisma.product.create({
    data: {
      categoryId: category.id,
      name: 'Produto Teste API',
      slug: `produto-teste-api-${Date.now()}`,
      description: 'Produto temporário usado apenas pelos testes automatizados.',
      priceCents: 10000,
      stock: 5,
    },
  });
  productId = product.id;

  const reg = await request(app).post('/api/auth/register').send({ name: 'Comprador Teste', email: EMAIL, password: 'Senha1234' }).expect(201);
  token = reg.body.data.token;
  const reg2 = await request(app).post('/api/auth/register').send({ name: 'Outro', email: OTHER_EMAIL, password: 'Senha1234' }).expect(201);
  otherToken = reg2.body.data.token;
});

after(async () => {
  await prisma.order.deleteMany({ where: { customerEmail: { in: [EMAIL, OTHER_EMAIL] } } });
  if (productId) await prisma.product.deleteMany({ where: { id: productId } });
  await prisma.address.deleteMany({ where: { user: { email: { in: [EMAIL, OTHER_EMAIL] } } } });
  await prisma.passwordResetToken.deleteMany({ where: { user: { email: { in: [EMAIL, OTHER_EMAIL] } } } });
  await prisma.user.deleteMany({ where: { email: { in: [EMAIL, OTHER_EMAIL] } } });
  await prisma.category.deleteMany({ where: { slug: 'categoria-teste-api' } });
  await prisma.$disconnect();
});

test('POST /api/cart/validate retorna validade e totais do backend', async () => {
  const response = await request(app).post('/api/cart/validate').send({ items: [{ productId, quantity: 2 }] }).expect(200);
  assert.equal(response.body.data.valid, true);
  assert.equal(response.body.data.subtotalCents, 20000);
});

test('POST /api/orders exige autenticação', async () => {
  await request(app).post('/api/orders').send(basePayload()).expect(401);
});

test('POST /api/orders rejeita payload inválido', async () => {
  const response = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send({ items: [] }).expect(400);
  assert.ok(response.body.error.message);
});

test('POST /api/orders cria pedido, baixa estoque e gera orderCode', async () => {
  const response = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send(basePayload()).expect(201);
  const order = response.body.data;
  assert.equal(order.status, 'PENDING');
  assert.equal(order.paymentStatus, 'NOT_PROCESSED');
  assert.equal(order.totalCents, 20000);
  assert.match(order.orderCode, /^WRD-\d{8}-[A-Z0-9]{8}$/);

  const product = await prisma.product.findUnique({ where: { id: productId } });
  assert.equal(product.stock, 3);

  await request(app).get(`/api/orders/${order.orderCode}`).expect(401);
  const detail = await request(app).get(`/api/orders/${order.orderCode}`).set('Authorization', `Bearer ${token}`).expect(200);
  assert.equal(detail.body.data.customerEmail, EMAIL);

  await request(app).get(`/api/orders/${order.orderCode}`).set('Authorization', `Bearer ${otherToken}`).expect(404);
  const list = await request(app).get('/api/orders').set('Authorization', `Bearer ${token}`).expect(200);
  assert.ok(list.body.data.some((o) => o.orderCode === order.orderCode));
});

test('POST /api/orders rejeita quantidade acima do estoque', async () => {
  await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send(basePayload({ items: [{ productId, quantity: 99 }] })).expect(409);
});

test('GET /api/orders/:code retorna 404 para código inexistente', async () => {
  await request(app).get('/api/orders/WRD-20990101-NOPE0000').set('Authorization', `Bearer ${token}`).expect(404);
});
