import { ArrowRight, ChevronRight, Cpu, Radio, ShieldCheck, Sparkles, Terminal, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

function HomeHero({ product }) {
  const image = product?.imageUrl || '/produtos/catalog/digital-culture/action-figure-lain.jpg';
  const name = product?.name || 'Produto em destaque';

  return (
    <section className="relative overflow-hidden border-b border-line bg-carbon">
      <div className="absolute inset-0 bg-hero-radial" />
      <div className="absolute inset-0 bg-grid opacity-30 [background-size:34px_34px]" />
      <div className="absolute inset-y-0 right-0 hidden w-1/2 opacity-20 lg:block" aria-hidden="true">
        <svg className="h-full w-full" viewBox="0 0 600 600" fill="none">
          <path d="M40 120H220L280 180H560" stroke="rgba(57,255,112,0.45)" />
          <path d="M0 260H160L220 320H420L470 370H600" stroke="rgba(57,255,112,0.28)" />
          <path d="M80 420H260L320 360H520" stroke="rgba(57,255,112,0.22)" />
          <circle cx="220" cy="120" r="4" fill="rgba(57,255,112,0.8)" />
          <circle cx="420" cy="320" r="4" fill="rgba(57,255,112,0.7)" />
          <circle cx="320" cy="360" r="4" fill="rgba(57,255,112,0.65)" />
        </svg>
      </div>
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-electric/10 blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyber/5 blur-3xl" aria-hidden="true" />

      <div className="container-page relative grid gap-10 py-14 sm:py-18 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:py-24">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-electric/25 bg-electric/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-electric-light">
            <span className="h-1.5 w-1.5 rounded-full bg-electric animate-pulse-soft" aria-hidden="true" />
            SYSTEM ONLINE
          </div>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[0.95] tracking-tight text-base sm:text-6xl lg:text-7xl">
            THE INTERNET IS
            <span className="mt-1 block bg-gradient-to-r from-electric-light via-electric to-cyber bg-clip-text text-transparent">PART OF REALITY.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-sub sm:text-lg">
            Hardware, digital culture and everything connected.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
            A WIRED.exe conecta eletrônica, retro computing, cultura geek e artefatos digitais em uma experiência de loja com identidade própria.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/catalogo" className="btn-primary sm:w-auto">
              EXPLORE PRODUCTS <ArrowRight size={17} />
            </Link>
            <Link to="/root-access" className="btn-ghost sm:w-auto">
              DISCOVER ROOT ACCESS <ChevronRight size={17} />
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Terminal, label: 'CATALOG', value: 'Curadoria real' },
              { icon: Cpu, label: 'HARDWARE', value: 'Lab + components' },
              { icon: Radio, label: 'CULTURE', value: 'Geek & digital' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-line/80 bg-panel/35 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted"><Icon size={13} className="text-electric-light" />{label}</div>
                <p className="mt-1 text-sm text-sub">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="surface relative overflow-hidden border-electric/20 p-4 shadow-soft sm:p-5">
            <div className="absolute inset-0 bg-grid opacity-20 [background-size:22px_22px]" />
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-electric/10 blur-3xl" aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-3 border-b border-line/80 pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">WIRED TERMINAL</p>
                <p className="mt-1 text-sm text-sub">Featured signal / {name}</p>
              </div>
              <span className="rounded-full border border-electric/30 bg-electric/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-electric-light">LIVE</span>
            </div>
            <div className="relative mt-4 overflow-hidden rounded-xl border border-line bg-void/55">
              <div className="absolute inset-0 bg-gradient-to-t from-void/60 via-transparent to-transparent" />
              <img src={image} alt={name} className="mx-auto aspect-[4/3] w-full max-h-[420px] object-contain p-6 sm:p-8" loading="eager" />
            </div>
            <div className="relative mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-line bg-carbon/50 px-3 py-2"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Access</p><p className="text-sm text-sub">Granted</p></div>
              <div className="rounded-lg border border-line bg-carbon/50 px-3 py-2"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Node</p><p className="text-sm text-sub">WIRED-01</p></div>
              <div className="rounded-lg border border-line bg-carbon/50 px-3 py-2"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Signal</p><p className="text-sm text-electric-light">Stable</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHero;

