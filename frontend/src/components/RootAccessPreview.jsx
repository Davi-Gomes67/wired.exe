import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';

const BENEFITS = ['Frete grátis nas compras elegíveis', 'Mystery Box mensal', 'Itens exclusivos', 'Acesso antecipado a lançamentos'];

export default function RootAccessPreview({ config }) {
  const price = formatPrice(config?.priceCents || 4990);
  const image = config?.campaignImage || '/produtos/root-access/root-access.jfif';
  return (
    <section className="container-page py-14 sm:py-20">
      <div className="surface relative overflow-hidden border-electric/20 p-6 sm:p-8 lg:p-10">
        <div className="absolute inset-0 bg-grid opacity-20 [background-size:26px_26px]" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-electric/10 blur-3xl" aria-hidden="true" />
        <div className="relative grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="overflow-hidden rounded-2xl border border-line bg-void/55">
            <img src={image} alt="WIRED.exe ROOT ACCESS" className="mx-auto max-h-[420px] w-full object-contain p-5 sm:p-8" loading="lazy" />
          </div>
          <div>
            <p className="eyebrow">// membership program</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-base sm:text-4xl">WIRED.exe — ROOT ACCESS</h2>
            <p className="mt-3 font-mono text-sm uppercase tracking-[0.24em] text-electric-light">ACCESS GRANTED.</p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">O programa de membros da WIRED.exe para quem quer benefícios reais, curadoria exclusiva e acesso antecipado enquanto a assinatura estiver ativa.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {BENEFITS.map((benefit) => (
                <div key={benefit} className="flex items-start gap-2 rounded-xl border border-line bg-carbon/40 px-3 py-3 text-sm text-sub">
                  <ShieldCheck size={15} className="mt-0.5 shrink-0 text-electric-light" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">A partir de</p>
                <p className="font-mono text-2xl font-semibold text-base">{price}<span className="text-sm text-muted">/mês</span></p>
              </div>
              <Link to="/root-access" className="btn-primary">GET ROOT ACCESS <ArrowRight size={17} /></Link>
            </div>
            <p className="mt-4 text-xs text-muted">Assinatura opcional. Benefícios elegíveis e válidos enquanto ativa, conforme condições configuradas.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

