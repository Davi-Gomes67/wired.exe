const prisma = require('../../config/prisma');

const DEFAULT_BENEFITS = [
  { title: 'Frete grátis elegível', description: 'Frete grátis em compras elegíveis enquanto a assinatura estiver ativa.' },
  { title: 'Mystery Box mensal', description: 'Uma seleção surpresa mensal com itens e colecionáveis do universo WIRED.exe.' },
  { title: 'Itens exclusivos', description: 'Adesivos e itens colecionáveis exclusivos para membros ativos.' },
  { title: 'Acesso antecipado', description: 'Acesso antecipado a lançamentos e drops selecionados.' },
  { title: 'Benefícios para membros', description: 'Vantagens exclusivas para membros ativos, conforme condições do programa.' },
];

const DEFAULT_FAQ = [
  { question: 'Como funciona o ROOT ACCESS?', answer: 'O ROOT ACCESS é a assinatura mensal de membros da WIRED.exe. Ao solicitar adesão, seu pedido fica pendente até a ativação/configuração do pagamento pela operação.' },
  { question: 'Quando recebo minha Mystery Box?', answer: 'A periodicidade e elegibilidade da Mystery Box dependem da assinatura ativa e das condições operacionais configuradas no momento da ativação.' },
  { question: 'Como funciona o frete grátis?', answer: 'O frete grátis se aplica a compras elegíveis enquanto a assinatura estiver ativa, conforme regras comerciais vigentes.' },
  { question: 'Posso cancelar minha assinatura?', answer: 'Solicitações de cancelamento seguem as condições configuradas pela WIRED.exe. Entre em contato pelo suporte para registrar sua solicitação.' },
  { question: 'Como acesso meus benefícios?', answer: 'Após a ativação da assinatura, os benefícios elegíveis são aplicados à sua conta conforme as condições do programa.' },
];

const DEFAULTS = {
  storeName: 'WIRED.exe',
  supportEmail: 'contato@wired.exe',
  whatsapp: '',
  instagram: '',
  heroTitle: 'Setup, cultura geek e hardware real.',
  heroSubtitle: 'Marketplace com catálogo real, checkout seguro e painel administrativo.',
  shippingInfo: 'Frete calculado no checkout.',
  returnPolicy: 'Trocas e devoluções em até 7 dias após o recebimento.',
  rootAccessEnabled: 'true',
  rootAccessPriceCents: '4990',
  rootAccessCampaignImage: '/produtos/root-access/root-access.jfif',
  rootAccessDescription: 'O programa de membros da WIRED.exe para quem quer ir além da compra: benefícios exclusivos, curadoria mensal e acesso antecipado.',
  rootAccessBenefits: JSON.stringify(DEFAULT_BENEFITS),
  rootAccessFaq: JSON.stringify(DEFAULT_FAQ),
  rootAccessConditions: 'Assinatura mensal válida enquanto ativa. Benefícios sujeitos a elegibilidade, disponibilidade e condições comerciais configuradas pela WIRED.exe. Pagamento recorrente será habilitado somente após configuração da integração.',
  rootAccessOfferCart: 'true',
  rootAccessOfferCheckout: 'true',
  rootAccessOfferPostPurchase: 'true',
};

const parseJson = (value, fallback) => {
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : fallback; } catch { return fallback; }
};

const toBool = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return fallback;
};

const normalizeSettings = (raw) => {
  const price = Number.parseInt(raw.rootAccessPriceCents, 10);
  return {
    ...raw,
    rootAccessEnabled: toBool(raw.rootAccessEnabled, true),
    rootAccessPriceCents: Number.isFinite(price) && price >= 0 ? price : 4990,
    rootAccessOfferCart: toBool(raw.rootAccessOfferCart, true),
    rootAccessOfferCheckout: toBool(raw.rootAccessOfferCheckout, true),
    rootAccessOfferPostPurchase: toBool(raw.rootAccessOfferPostPurchase, true),
    rootAccessBenefits: parseJson(raw.rootAccessBenefits, DEFAULT_BENEFITS),
    rootAccessFaq: parseJson(raw.rootAccessFaq, DEFAULT_FAQ),
  };
};

const getSettings = async () => {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return normalizeSettings({ ...DEFAULTS, ...map });
};

const getRawSettings = async () => {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULTS, ...map };
};

const sanitizeString = (value, fallback) => (typeof value === 'string' ?value.trim() : fallback);
const sanitizeBoolString = (value, fallback) => (value === true || value === 'true' ?'true' : value === false || value === 'false' ?'false' : fallback);
const sanitizePrice = (value, fallback) => {
  const n = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) && n >= 0 ? String(n) : fallback;
};
const sanitizeJsonArray = (value, fallback, shape) => {
  let arr = value;
  if (typeof value === 'string') { try { arr = JSON.parse(value); } catch { return fallback; } }
  if (!Array.isArray(arr)) return fallback;
  const clean = arr.slice(0, 12).map((item) => {
    const out = {};
    for (const key of shape) out[key] = typeof item?.[key] === 'string' ?item[key].trim().slice(0, 300) : '';
    return out;
  }).filter((item) => shape.every((k) => item[k]));
  return clean.length ? JSON.stringify(clean) : fallback;
};

const updateSettings = async (data) => {
  const entries = Object.entries(DEFAULTS).map(([key, fallback]) => {
    const value = data[key];
    if (key.startsWith('rootAccessOffer') || key === 'rootAccessEnabled') return [key, sanitizeBoolString(value, fallback)];
    if (key === 'rootAccessPriceCents') return [key, sanitizePrice(value, fallback)];
    if (key === 'rootAccessBenefits') return [key, sanitizeJsonArray(value, fallback, ['title', 'description'])];
    if (key === 'rootAccessFaq') return [key, sanitizeJsonArray(value, fallback, ['question', 'answer'])];
    return [key, sanitizeString(value, fallback) || fallback];
  });
  await prisma.$transaction(entries.map(([key, value]) => prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })));
  return getRawSettings();
};

const getPublicSettings = async () => {
  const s = await getSettings();
  return {
    storeName: s.storeName,
    supportEmail: s.supportEmail,
    whatsapp: s.whatsapp,
    instagram: s.instagram,
    rootAccess: {
      enabled: s.rootAccessEnabled,
      priceCents: s.rootAccessPriceCents,
      campaignImage: s.rootAccessCampaignImage,
      description: s.rootAccessDescription,
      benefits: s.rootAccessBenefits,
      faq: s.rootAccessFaq,
      conditions: s.rootAccessConditions,
      offerCart: s.rootAccessOfferCart,
      offerCheckout: s.rootAccessOfferCheckout,
      offerPostPurchase: s.rootAccessOfferPostPurchase,
    },
  };
};

module.exports = { getSettings, getRawSettings, updateSettings, getPublicSettings, DEFAULTS, DEFAULT_BENEFITS, DEFAULT_FAQ };
