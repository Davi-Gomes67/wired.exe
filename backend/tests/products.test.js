const assert = require('node:assert/strict');
const { test } = require('node:test');
const request = require('supertest');
const app = require('../src/app');

test('GET /api/health responde com status ok', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.service, 'WIRED.exe API');
});

test('GET /api/categories retorna categorias com contagem de produtos', async () => {
  const response = await request(app).get('/api/categories').expect(200);
  assert.ok(Array.isArray(response.body.data));
  if (response.body.data.length > 0) {
    assert.equal(typeof response.body.data[0].productCount, 'number');
  }
});

test('GET /api/products pagina e filtra corretamente', async () => {
  const response = await request(app)
    .get('/api/products?page=1&pageSize=2&sort=price-asc')
    .expect(200);
  assert.ok(Array.isArray(response.body.data));
  assert.equal(response.body.data.length <= 2, true);
  assert.equal(response.body.meta.page, 1);
  assert.equal(response.body.meta.pageSize, 2);
  assert.equal(typeof response.body.meta.total, 'number');
});

test('GET /api/products filtra por faixa de preço', async () => {
  const response = await request(app)
    .get('/api/products?minPrice=100&maxPrice=500&sort=price-asc')
    .expect(200);
  assert.ok(Array.isArray(response.body.data));
  for (const product of response.body.data) {
    assert.equal(product.priceCents >= 10000, true);
    assert.equal(product.priceCents <= 50000, true);
  }
});

test('GET /api/products/:slug retorna galeria e especificações', async () => {
  const list = await request(app).get('/api/products?pageSize=48').expect(200);
  const candidate = list.body.data.find((p) => p.slug && p.slug !== 'teclado-mecanico-wired-k87') || list.body.data[0];
  assert.notEqual(candidate.slug, 'teclado-mecanico-wired-k87');
  assert.ok(candidate, 'precisa de produto para testar slug');
  const response = await request(app).get(`/api/products/${candidate.slug}`).expect(200);
  assert.ok(Array.isArray(response.body.data.images));
  assert.ok(Array.isArray(response.body.data.specifications));
  assert.equal(typeof response.body.data.brand === 'string' || response.body.data.brand === null, true);
});

test('GET /api/products/:slug inexistente retorna 404', async () => {
  await request(app).get('/api/products/slug-que-nao-existe-xyz').expect(404);
});

test('GET /api/rota-inexistente retorna 404 padronizado', async () => {
  const response = await request(app).get('/api/rota-inexistente').expect(404);
  assert.ok(response.body.error.message);
});
