import { useEffect, useState } from 'react';
import { ArrowRight, Cpu, Radio, ShieldCheck, Sparkles, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandStrip from '../components/BrandStrip';
import CategoryShowcase from '../components/CategoryShowcase';
import HeroBanner from '../components/HeroBanner';
import NewsletterSection from '../components/NewsletterSection';
import ProductGrid from '../components/ProductGrid';
import SectionHeading, { SectionAction } from '../components/SectionHeading';
import { catalogService, getErrorMessage } from '../services/api';

const PERKS = [
  { icon: Terminal, title: 'Catálogo completo', text: 'Todos os produtos locais integrados ao catálogo.' },
  { icon: Cpu, title: 'Hardware & eletrônica', text: 'Laboratório, componentes, periféricos e retro.' },
  { icon: ShieldCheck, title: 'Checkout transparente', text: 'Pedido registrado sem cobrança online real.' },
];

const PROMO = [
  { tag: 'FIRST BOOT', title: 'Primeiro contato com a bancada', text: 'Kits e peças para começar seu projeto.', to: '/categoria/starter-packs' },
  { tag: '404 PRICE NOT FOUND', title: 'Achados fora do sistema', text: 'Exploração livre pelo catálogo completo.', to: '/catalogo' },
  { tag: 'MAKER COMBO', title: 'Monte, teste, repita', text: 'Componentes e hardware para makers.', to: '/categoria/components' },
  { tag: 'GEEK COLLECTION', title: 'Identidade no sinal', text: 'Vestuário e cultura para quem vive conectado.', to: '/categoria/geek-wear' },
  { tag: 'SYSTEM UPGRADE', title: 'Evolua o setup', text: 'Periféricos e melhorias para sua estação.', to: '/categoria/peripherals' },
];

function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [offers, setOffers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    Promise.all([
      catalogService.getProducts({ featured: 'true', pageSize: 8 }, controller.signal),
      catalogService.getProducts({ offer: 'true', pageSize: 4, sort: 'newest' }, controller.signal),
      catalogService.getProducts({ sort: 'newest', pageSize: 8 }, controller.signal),
      catalogService.getCategories(controller.signal),
      catalogService.getBrands(controller.signal),
      catalogService.getProductBySlug('action-figure-lain', controller.signal).catch(() => null),
    ])
      .then(([featRes, offerRes, newRes, catRes, brandRes, lainRes]) => {
        const lainProduct = lainRes?.data;
        const feat = featRes.data || [];
        setFeatured(lainProduct ? [lainProduct, ...feat.filter((p) => p.slug !== lainProduct.slug)].slice(0, 4) : feat.slice(0, 4));
        setOffers(offerRes.data || []);
        setNewArrivals(newRes.data || []);
        setCategories(catRes.data || []);
        setBrands((brandRes.data || []).slice(0, 6));
      })
      .catch((err) => {
        if (err.code !== 'ERR_CANCELED') setError(getErrorMessage(err));
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const lain = featured.find((p) => p.slug === 'action-figure-lain')
    || newArrivals.find((p) => p.slug === 'action-figure-lain')
    || offers.find((p) => p.slug === 'action-figure-lain');
  const heroProduct = lain || featured[0] || newArrivals[0];

  return (
    <div>
      <HeroBanner product={heroProduct} />

      <section className="border-b border-line bg-carbon/30">
        <div className="container-page grid gap-4 py-5 sm:grid-cols-3 sm:py-6">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-electric/10 text-electric-light ring-1 ring-electric/20">
                <Icon size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#D7EBDD]">{title}</p>
                <p className="text-xs leading-relaxed text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <SectionHeading eyebrow="// system areas" title="Sinal aberto" description="Áreas da WIRED.exe para explorar hardware, cultura e eletrônica." action={<SectionAction to="/catalogo">Ver Products</SectionAction>} />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {PROMO.map(({ tag, title, text, to }) => (
            <Link key={tag} to={to} className="surface surface-hover group relative overflow-hidden p-4">
              <div className="absolute inset-0 bg-grid opacity-15 [background-size:18px_18px]" />
              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-light">{tag}</p>
                <h3 className="mt-3 text-sm font-semibold text-[#D7EBDD]">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <SectionHeading eyebrow="// seleção wired" title="Produtos em destaque" description="Itens selecionados do catálogo local, com identidade WIRED.exe." action={<SectionAction to="/catalogo">Ver Products</SectionAction>} />
        <ProductGrid products={featured} loading={loading} error={error} emptyTitle="Sem destaques no momento" emptyDescription="Marque produtos como destaque no admin." />
      </section>

      <section className="border-y border-line bg-[linear-gradient(180deg,rgba(57,255,112,0.06),transparent_30%,transparent_70%,rgba(0,255,65,0.04))] py-14 sm:py-16">
        <div className="container-page">
          <SectionHeading eyebrow="// 404 price not found" title="Ofertas do sistema" description="Produtos com preço comparativo quando disponível." action={<SectionAction to="/catalogo?offer=true">Ver ofertas</SectionAction>} />
          <div className="mb-6 flex items-center gap-2 text-xs text-muted"><Radio size={14} className="text-electric-light" /><span>Ofertas aparecem apenas quando há compareAt válido no banco.</span></div>
          <ProductGrid products={offers} loading={loading} error={error} emptyTitle="Nenhuma oferta ativa" emptyDescription="Quando houver compareAt válido, os produtos aparecem aqui." />
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <SectionHeading eyebrow="// first boot" title="Últimos adicionados" description="Entradas recentes no catálogo WIRED.exe." action={<SectionAction to="/catalogo?sort=newest">Explorar novidades</SectionAction>} />
        <div className="mb-6 flex items-center gap-2 text-xs text-muted"><Sparkles size={14} className="text-electric-light" /><span>Ordenado pela criação real dos produtos no banco.</span></div>
        <ProductGrid products={newArrivals} loading={loading} error={error} emptyTitle="Sem novidades" emptyDescription="Novos produtos aparecerão aqui." />
      </section>
      <section className="border-y border-line bg-carbon/40 py-14 sm:py-16">
        <div className="container-page">
          <SectionHeading eyebrow="// departamentos" title="Explore por categoria" description="Navegue pelos universos da WIRED.exe com acesso direto ao catálogo." action={<SectionAction to="/catalogo">Todos os departamentos</SectionAction>} />
          {categories.length > 0 ? <CategoryShowcase categories={categories} /> : <p className="text-sm text-muted">Carregando departamentos...</p>}
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <SectionHeading eyebrow="// marcas" title="Marcas no sinal" description="Fabricantes e labels presentes nos produtos disponíveis." action={<SectionAction to="/catalogo">Ver Products</SectionAction>} />
        <BrandStrip brands={brands} />
      </section>
      <NewsletterSection />

      <section className="container-page py-14 sm:py-16">
        <div className="surface relative overflow-hidden p-6 sm:p-10">
          <div className="absolute inset-0 bg-grid opacity-20 [background-size:28px_28px]" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-electric/10 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow">SYSTEM UPGRADE</p>
              <h2 className="section-title mt-3">Hardware for your projects. Culture for your identity.</h2>
              <p className="section-desc">A WIRED.exe é um catálogo tecnológico e espaço de cultura geek — conectando eletrônica, retro computing e identidade digital.</p>
            </div>
            <Link to="/catalogo" className="btn-primary w-full sm:w-auto">
              Abrir Products <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
