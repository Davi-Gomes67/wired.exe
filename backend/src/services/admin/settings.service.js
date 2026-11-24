const prisma = require('../../config/prisma');

const DEFAULTS = {
  storeName: 'WIRED.exe',
  supportEmail: 'contato@wired.exe',
  whatsapp: '',
  instagram: '',
  heroTitle: 'Setup, cultura geek e hardware real.',
  heroSubtitle: 'Marketplace com catálogo real, checkout seguro e painel administrativo.',
  shippingInfo: 'Frete calculado no checkout.',
  returnPolicy: 'Trocas e devoluções em até 7 dias após o recebimento.',
};

const getSettings = async () => {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULTS, ...map };
};

const updateSettings = async (data) => {
  const entries = Object.entries(DEFAULTS).map(([key]) => [key, typeof data[key] === 'string' ? data[key].trim() : DEFAULTS[key]]);
  await prisma.$transaction(entries.map(([key, value]) => prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })));
  return getSettings();
};

module.exports = { getSettings, updateSettings, DEFAULTS };
