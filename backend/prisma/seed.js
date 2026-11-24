const fs = require('fs');
const path = require('path');
const prisma = require('../src/config/prisma');

const CATEGORIES = [
  { name: 'HARDWARE LAB', slug: 'hardware-lab', description: 'Placas, microcontroladores e ferramentas para montar, testar e evoluir projetos.' },
  { name: 'COMPONENTS', slug: 'components', description: 'Pe�as essenciais, sensores e m�dulos para eletr�nica e prototipagem.' },
  { name: 'PERIPHERALS', slug: 'peripherals', description: 'Teclados, mouses, �udio e acess�rios para sua esta��o.' },
  { name: 'RETRO COMPUTING', slug: 'retro-computing', description: 'M�quinas, port�teis e rel�quias inspiradas na era cl�ssica da computa��o.' },
  { name: 'GEEK WEAR', slug: 'geek-wear', description: 'Vestu�rio e acess�rios com identidade tech, geek e cultura digital.' },
  { name: 'DIGITAL CULTURE', slug: 'digital-culture', description: 'Colecion�veis, figures e objetos da cultura digital e underground.' },
  { name: 'STARTER PACKS', slug: 'starter-packs', description: 'Kits iniciais para come�ar r�pido em eletr�nica, maker e computa��o.' },
];

const KNOWN_BRANDS = ['Arduino','Raspberry Pi','ESP32','ESP32-S3-BOX-3','Seeed Studio','Logitech','Redragon','HyperX','Corsair','Havit','UGREEN','Anbernic','TrimUI','Playdate','Flipper Zero','Funko','ELEGOO'];

function inferBrand(name) {
  const n = name.toLowerCase();
  for (const b of KNOWN_BRANDS) if (n.includes(b.toLowerCase())) return b;
  if (n.startsWith('kit funko') || n.startsWith('funko')) return 'Funko';
  if (n.includes('raspberry pi')) return 'Raspberry Pi';
  if (n.includes('arduino')) return 'Arduino';
  if (n.includes('esp32')) return 'ESP32';
  return null;
}

function descriptionFor(item) {
  const cat = CATEGORIES.find((c) => c.slug === item.categorySlug)?.name || item.categorySlug;
  return `${item.name} — item do departamento ${cat} no catálogo WIRED.exe. Hardware for your projects. Culture for your identity.`;
}

function loadPricing() {
  const pricingPath = path.resolve(__dirname, 'pricing-manifest.json');
  if (!fs.existsSync(pricingPath)) return new Map();
  const rows = JSON.parse(fs.readFileSync(pricingPath, 'utf8'));
  return new Map(rows.map((r) => [r.slug, r]));
}

async function main() {
  const manifestPath = path.resolve(__dirname, 'catalog-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const pricing = loadPricing();
  const seenSlugs = new Set();
  for (const item of manifest) {
    if (seenSlugs.has(item.slug)) throw new Error(`Duplicado no manifesto: ${item.slug}`);
    seenSlugs.add(item.slug);
  }

  const categoryIds = new Map();
  for (const category of CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: category,
    });
    categoryIds.set(category.slug, record.id);
  }

  let upserted = 0;
  for (const item of manifest) {
    const categoryId = categoryIds.get(item.categorySlug);
    if (!categoryId) throw new Error(`Categoria não mapeada: ${item.categorySlug}`);
    const existing = await prisma.product.findUnique({ where: { slug: item.slug }, select: { id: true, priceCents: true, compareAtCents: true, stock: true, featured: true } });
    const p = pricing.get(item.slug);
    const data = {
      categoryId,
      name: item.name,
      slug: item.slug,
      description: descriptionFor(item),
      brand: inferBrand(item.name),
      priceCents: p ? Number(p.priceCents || 0) : (existing?.priceCents ?? 0),
      compareAtCents: p ? (p.compareAtCents == null ? null : Number(p.compareAtCents)) : (existing?.compareAtCents ?? null),
      stock: p ? Number(p.stock ?? 0) : (existing?.stock ?? 0),
      imageUrl: item.imageUrl,
      featured: existing?.featured ?? false,
    };
    const saved = await prisma.product.upsert({
      where: { slug: item.slug },
      update: data,
      create: data,
    });
    await prisma.productImage.deleteMany({ where: { productId: saved.id } });
    await prisma.productImage.create({ data: { productId: saved.id, url: item.imageUrl, alt: item.name, sortOrder: 0 } });
    upserted += 1;
  }

  const stale = await prisma.product.findMany({ where: { slug: { notIn: [...seenSlugs] } }, select: { id: true, slug: true, _count: { select: { orderItems: true } } } });
  let removed = 0; const kept = [];
  for (const p of stale) {
    if (p._count.orderItems > 0) { kept.push(p.slug); continue; }
    await prisma.productImage.deleteMany({ where: { productId: p.id } });
    await prisma.productSpecification.deleteMany({ where: { productId: p.id } });
    await prisma.product.delete({ where: { id: p.id } });
    removed += 1;
  }

  const counts = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: 'asc' } });
  console.log(JSON.stringify({ manifest: manifest.length, upserted, removed, keptStale: kept, categories: counts.map((c) => ({ slug: c.slug, name: c.name, products: c._count.products })) }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());