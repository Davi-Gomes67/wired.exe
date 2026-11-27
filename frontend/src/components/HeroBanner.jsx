import { ArrowRight, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';

export default function HeroBanner({ product }) {
  const spotlight = product?.slug === 'action-figure-lain';
  return (
    <section className="relative overflow-hidden border-b border-line bg-carbon">
      <div className="absolute inset-0 bg-hero-radial" />
      <div className="absolute inset-0 bg-grid opacity-35 [background-size:36px_36px]" />
      <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-electric/10 blur-3xl" />
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-cyber/5 blur-3xl" />

      <div className="container-page relative grid gap-10 py-12 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-10 lg:py-20">
        <div className="max-w-2xl animate-fade-up">
          <p className="eyebrow mb-4 inline-flex items-center gap-2 rounded-full border border-electric/25 bg-electric/10 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyber" aria-hidden="true" />
            TECHNOLOGY â€¢ GEEK CULTURE â€¢ ELECTRONICS
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-[0.98] tracking-tight text-base sm:text-5xl lg:text-6xl xl:text-7xl">
            The internet
            <span className="block bg-gradient-to-r from-electric-light via-electric to-cyber bg-clip-text text-transparent">
              is part of
            </span>
            reality.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Hardware for your projects. Culture for your identity. Um cat?logo tecnol?gico e espa?o de cultura geek â€” da bancada ao setup, do retro ao digital.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/catalogo" className="btn-primary">
              Explorar Products <ArrowRight size={17} />
            </Link>
            <Link to="/categoria/hardware-lab" className="btn-ghost">
              Entrar no Hardware Lab
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <span><span className="text-electric">01</span> Hardware</span>
            <span><span className="text-electric">02</span> Geek culture</span>
            <span><span className="text-electric">03</span> Electronics</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="surface relative overflow-hidden border-electric/25 p-5 shadow-soft sm:p-7">
            <div className="absolute inset-0 bg-grid opacity-20 [background-size:24px_24px]" />
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-electric/10 blur-3xl" />
            <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-electric/40 via-electric/10 to-transparent" />
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                  <Terminal size={13} className="text-electric" aria-hidden="true" />
                  {spotlight ?'WIRED SPOTLIGHT' : 'SYSTEM UPGRADE'}
                </span>
                <span className="rounded-full border border-electric/30 bg-electric/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-electric-light">
                  {spotlight ?'Digital Culture' : product?.featured ?'Em destaque' : 'Cat?logo'}
                </span>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_0.95fr] sm:items-end">
                <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-xl border border-line bg-void/60 p-4 sm:min-h-[340px]">
                  <div className="absolute inset-x-4 top-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted/80">
                    <span>lain://figure</span>
                    <span className="text-electric/80">online</span>
                  </div>
                  {product?.imageUrl ?(
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="max-h-[320px] w-full object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.55)]"
                      loading="eager"
                    />
                  ) : (
                    <div className="skeleton h-full min-h-[240px] w-full" />
                  )}
                </div>

                <div className="pb-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-electric/90">
                    {spotlight ?'Serial Experiments Lain' : (product?.brand || 'WIRED.exe')}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-base sm:text-3xl">
                    {product?.name || 'Carregando produto...'}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {spotlight
                      ?'Uma pe?a de cole?o para quem atravessa a fronteira entre rede, identidade e cultura digital. Presen?a underground, nostalgia wired e a aura inquieta de Lain.'
                      : 'Produto selecionado do cat?logo WIRED.exe, com identidade tech e curadoria geek.'}
                  </p>
                  {product && (
                    <p className="mt-5 font-mono text-2xl font-semibold tracking-tight text-base">
                      {formatPrice(product.priceCents)}
                    </p>
                  )}
                  {product?.slug && (
                    <Link to={`/produto/${product.slug}`} className="btn-primary mt-5 w-full sm:w-auto">
                      Ver produto <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

