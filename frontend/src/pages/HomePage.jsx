import { useEffect, useState } from 'react';
import { ArrowRight, Cpu, Radio, ShieldCheck, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandStrip from '../components/BrandStrip';
import DepartmentsSection from '../components/DepartmentsSection';
import HomeHero from '../components/HomeHero';
import JournalCard from '../components/journal/JournalCard';
import NewsletterSection from '../components/NewsletterSection';
import ProductGrid from '../components/ProductGrid';
import RootAccessPreview from '../components/RootAccessPreview';
import SectionHeading, { SectionAction } from '../components/SectionHeading';
import { catalogService, getErrorMessage, journalService, rootAccessService } from '../services/api';
import { formatPrice } from '../utils/format';

const PERKS = [
  { icon: Terminal, title: 'Catálogo real', text: 'Produtos e categorias vindos do catálogo ativo da WIRED.exe.' },
  { icon: Cpu, title: 'Hardware & cultura', text: 'Eletrônica, retro, peripherals e cultura digital no mesmo sistema.' },
  { icon: ShieldCheck, title: 'Compra transparente', text: 'Carrinho, checkout e pedido com fluxo real do projeto.' },
];

function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [discovery, setDiscovery] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [rootConfig, setRootConfig] = useState(null);
  const [journalArticles, setJournalArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    Promise.all([
      catalogService.getProducts({ featured: 'true', pageSize: 8 }, controller.signal).catch(() => ({ data: [] })),
      catalogService.getProducts({ sort: 'newest', pageSize: 8 }, controller.signal).catch(() => ({ data: [] })),
      catalogService.getCategories(controller.signal).catch(() => ({ data: [] })),
      catalogService.getBrands(controller.signal).catch(() => ({ data: [] })),
      catalogService.getProductBySlug('action-figure-lain').catch(() => null),
      rootAccessService.getPublic().catch(() => ({ data: null })),
      journalService.recent(3, controller.signal).catch(() => ({ data: [] })),
    ])
      .then(([featRes, newRes, catRes, brandRes, lainRes, rootRes, journalRes]) => {
        const feat = featRes.data || [];
        const lainProduct = lainRes?.data || null;
        setFeatured(lainProduct ?[lainProduct, ...feat.filter((p) => p.slug !== lainProduct.slug)].slice(0, 4) : feat.slice(0, 4));
        setDiscovery((newRes.data || []).slice(0, 8));
        setCategories(catRes.data || []);
        setBrands((brandRes.data || []).slice(0, 8));
        setRootConfig(rootRes?.data || null);
        setJournalArticles(Array.isArray(journalRes?.data) ? journalRes.data : []);
      })
      .catch((requestError) => {
        if (requestError.name !== 'CanceledError' && requestError.code !== 'ERR_CANCELED') {
          setError(getErrorMessage(requestError));
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const lain = featured.find((p) => p.slug === 'action-figure-lain') || featured[0] || discovery[0];
  const heroProduct = lain || discovery[0] || null;

  return (
    <div className="overflow-x-hidden">
      <HomeHero product={heroProduct} />

      <section className="border-b border-line bg-panel/25">
        <div className="container-page grid gap-6 py-6 sm:grid-cols-3 sm:py-8">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-electric/25 bg-electric/10 text-electric-light"><Icon size={20} /></span>
              <div>
                <p className="text-sm font-semibold text-base">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-14 sm:py-20">
        <SectionHeading
          eyebrow="// featured signal"
          title="Action Figure da Lain"
          description="O destaque principal da WIRED.exe permanece conectado ao universo de Serial Experiments Lain e à cultura digital que define a marca."
        />
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <Link to={lain ?`/produto/${lain.slug}` : '/catalogo'} className="surface group relative overflow-hidden border-electric/20 p-5 sm:p-7">
            <div className="absolute inset-0 bg-grid opacity-20 [background-size:24px_24px]" />
            <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-electric/10 blur-3xl" aria-hidden="true" />
            <p className="relative font-mono text-[11px] uppercase tracking-[0.24em] text-electric-light">FEATURED PRODUCT</p>
            <div className="relative mt-6 overflow-hidden rounded-2xl border border-line bg-void/50">
              <img
                src={lain?.imageUrl || '/produtos/catalog/digital-culture/action-figure-lain.jpg'}
                alt={lain?.name || 'Action Figure da Lain'}
                className="mx-auto aspect-[4/3] w-full max-h-[480px] object-contain p-6 transition duration-500 group-hover:scale-[1.02] sm:p-8"
                loading="lazy"
              />
            </div>
          </Link>

          <div className="surface relative overflow-hidden p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-electric/8 via-transparent to-transparent" />
            <div className="relative">
              <p className="eyebrow">WIRED SPOTLIGHT</p>
              <h3 className="mt-3 font-display text-3xl font-bold tracking-tight text-base sm:text-4xl">{lain?.name || 'Action Figure Lain'}</h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                {lain?.description || 'Peça de destaque da cultura digital WIRED.exe. Consulte a página do produto para detalhes atualizados.'}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-carbon/40 p-4"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Category</p><p className="mt-1 text-sm text-sub">{lain?.category?.name || 'DIGITAL CULTURE'}</p></div>
                <div className="rounded-xl border border-line bg-carbon/40 p-4"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Status</p><p className="mt-1 text-sm text-sub">{lain?.stock > 0 ?`${lain.stock} em estoque` : lain ?'Indisponível' : 'Carregando'}</p></div>
                <div className="rounded-xl border border-line bg-carbon/40 p-4 sm:col-span-2"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Price</p><p className="mt-1 font-mono text-xl text-base">{lain ? formatPrice(lain.priceCents) : '—'}</p></div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={lain ?`/produto/${lain.slug}` : '/catalogo'} className="btn-primary sm:w-auto">Ver produto <ArrowRight size={17} /></Link>
                <Link to="/catalogo?category=digital-culture" className="btn-ghost sm:w-auto">Digital Culture</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-14 sm:pb-20">
        <SectionHeading
          eyebrow="// departments"
          title="Navegue por departamentos"
          description="Sete áreas do ecossistema WIRED.exe, conectadas às categorias reais do catálogo."
        />
        <DepartmentsSection categories={categories} />
      </section>

      <RootAccessPreview config={rootConfig} />

      <section className="container-page py-14 sm:py-20">
        <SectionHeading
          eyebrow="// product discovery"
          title="Descubra o catálogo"
          description="Novidades e produtos reais do sistema. Adicione ao carrinho direto no card ou abra os detalhes."
          action={<SectionAction to="/catalogo">Explorar catálogo</SectionAction>}
        />
        <ProductGrid
          products={discovery}
          loading={loading}
          error={error}
          emptyTitle="Nenhum produto disponível"
          emptyDescription="O catálogo ainda não retornou produtos para exibição."
        />
      </section>

      {brands.length > 0 && (
        <section className="container-page pb-14 sm:pb-20">
          <SectionHeading
            eyebrow="// brands"
            title="Marcas no sinal"
            description="Fabricantes e linhas que aparecem no catálogo WIRED.exe."
            action={<SectionAction to="/catalogo">Catálogo completo</SectionAction>}
          />
          <BrandStrip brands={brands} />
        </section>
      )}

      {journalArticles.length > 0 && (
        <section className="container-page pb-14 sm:pb-20">
          <SectionHeading
            eyebrow="// wired journal"
            title="Documentando o mundo digital"
            description="Artigos, cultura digital e tecnologia além do consumo."
            action={<SectionAction to="/journal">Abrir Journal</SectionAction>}
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {journalArticles.map((article) => <JournalCard key={article.id} article={article} compact />)}
          </div>
        </section>
      )}

      <NewsletterSection />

      <section className="container-page pb-16 sm:pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-panel/50 p-8 sm:p-12">
          <div className="absolute inset-0 bg-grid opacity-25 [background-size:28px_28px]" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-electric/10 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-2xl">
            <p className="eyebrow">// system upgrade</p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-base sm:text-4xl">Monte seu setup com identidade.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">Do hardware ao objeto de cultura digital, a WIRED.exe organiza o catálogo para descoberta rápida e compra real.</p>
            <Link to="/catalogo" className="btn-primary mt-7 inline-flex">Abrir catálogo <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;

