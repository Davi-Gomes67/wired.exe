import { useEffect, useState } from 'react';
import { ArrowRight, Box, CheckCircle2, ChevronDown, Cpu, Gift, Loader2, Lock, ShieldCheck, Sparkles, Terminal, Zap } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, rootAccessService } from '../services/api';
import { formatPrice } from '../utils/format';

const ICONS = [Zap, Gift, Sparkles, Terminal, ShieldCheck, Cpu, Box, Lock];

const DEFAULT_CONFIG = {
  enabled: true,
  priceCents: 4990,
  campaignImage: '/produtos/root-access/root-access.jfif',
  description: 'O programa de membros da WIRED.exe para quem quer ir além da compra: benefícios exclusivos, curadoria mensal e acesso antecipado.',
  benefits: [
    { title: 'Frete grátis elegível', description: 'Frete grátis em compras elegíveis enquanto a assinatura estiver ativa.' },
    { title: 'Mystery Box mensal', description: 'Uma seleção surpresa mensal com itens e colecionáveis do universo WIRED.exe.' },
    { title: 'Itens exclusivos', description: 'Adesivos e itens colecionáveis exclusivos para membros ativos.' },
    { title: 'Acesso antecipado', description: 'Acesso antecipado a lançamentos e drops selecionados.' },
    { title: 'Benefícios para membros', description: 'Vantagens exclusivas para membros ativos, conforme condições do programa.' },
  ],
  faq: [
    { question: 'Como funciona o ROOT ACCESS?', answer: 'O ROOT ACCESS é a assinatura mensal de membros da WIRED.exe. Ao solicitar adesão, seu pedido fica pendente até a ativação/configuração do pagamento pela operação.' },
    { question: 'Quando recebo minha Mystery Box?', answer: 'A periodicidade e elegibilidade da Mystery Box dependem da assinatura ativa e das condições operacionais configuradas no momento da ativação.' },
    { question: 'Como funciona o frete grátis?', answer: 'O frete grátis se aplica a compras elegíveis enquanto a assinatura estiver ativa, conforme regras comerciais vigentes.' },
    { question: 'Posso cancelar minha assinatura?', answer: 'Solicitações de cancelamento seguem as condições configuradas pela WIRED.exe. Entre em contato pelo suporte para registrar sua solicitação.' },
    { question: 'Como acesso meus benefícios?', answer: 'Após a ativação da assinatura, os benefícios elegíveis são aplicados à sua conta conforme as condições do programa.' },
  ],
  conditions: 'Assinatura mensal válida enquanto ativa. Benefícios sujeitos a elegibilidade, disponibilidade e condições comerciais configuradas pela WIRED.exe. Pagamento recorrente será habilitado somente após configuração da integração.',
};

function RootAccessPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    let active = true;
    rootAccessService.getPublic()
      .then((res) => { if (active && res.data) setConfig((prev) => ({ ...prev, ...res.data })); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const scrollToBenefits = () => document.getElementById('root-access-benefits')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleSubscribe = async () => {
    setFeedback({ type: '', message: '' });
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
      return;
    }
    if (!acceptTerms) {
      setFeedback({ type: 'error', message: 'Você precisa aceitar os termos para solicitar o ROOT ACCESS.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await rootAccessService.request({ acceptTerms: true, source: 'PAGE' });
      const exists = res.data?.alreadyExists;
      setFeedback({
        type: 'success',
        message: exists
          ?'Você já possui uma solicitação ou assinatura ROOT ACCESS ativa/pendente. Acompanhe pelo suporte ou aguarde a ativação.'
          : 'Solicitação ROOT ACCESS registrada com status PENDENTE. Nenhuma cobrança foi realizada. A ativação depende da configuração da integração de pagamento recorrente.',
      });
    } catch (error) {
      setFeedback({ type: 'error', message: getErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  const price = formatPrice(config.priceCents || 4990);
  const benefits = Array.isArray(config.benefits) && config.benefits.length ? config.benefits : DEFAULT_CONFIG.benefits;
  const faq = Array.isArray(config.faq) && config.faq.length ? config.faq : DEFAULT_CONFIG.faq;

  return (
    <div className="bg-void text-base">
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-grid opacity-30 [background-size:28px_28px]" />
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-electric/10 blur-3xl" />
        <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-cyber/5 blur-3xl" />
        <div className="container-page relative grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="animate-fade-up">
            <p className="eyebrow">// WIRED.exe MEMBERSHIP</p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              ROOT <span className="bg-gradient-to-r from-electric-light via-electric to-cyber bg-clip-text text-transparent">ACCESS</span>
            </h1>
            <p className="mt-4 font-mono text-sm uppercase tracking-[0.28em] text-electric-light sm:text-base">ACCESS GRANTED.</p>
            <p className="mt-3 text-sm uppercase tracking-[0.18em] text-muted">THE INTERNET IS PART OF REALITY.</p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-sub sm:text-lg">{config.description}</p>
            <div className="mt-8 flex flex-wrap items-end gap-4">
              <div className="rounded-2xl border border-electric/30 bg-electric/10 px-5 py-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-electric-light">Assinatura mensal</p>
                <p className="mt-1 font-mono text-3xl font-semibold text-base">{price}<span className="text-base text-muted">/mês</span></p>
              </div>
              <p className="max-w-xs text-xs text-muted">Válida enquanto ativa. Cobrança recorrente somente após configuração da integração de pagamento.</p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#root-access-subscribe" className="btn-primary sm:w-auto">GET ROOT ACCESS <ArrowRight size={17} /></a>
              <button type="button" onClick={scrollToBenefits} className="btn-ghost sm:w-auto">EXPLORE BENEFITS</button>
            </div>
          </div>
          <div className="surface relative overflow-hidden border-electric/25 p-4 shadow-soft sm:p-6">
            <div className="absolute inset-0 bg-grid opacity-20 [background-size:24px_24px]" />
            <div className="relative overflow-hidden rounded-xl border border-line bg-void/60">
              <img src={config.campaignImage || DEFAULT_CONFIG.campaignImage} alt="WIRED.exe ROOT ACCESS" className="mx-auto max-h-[460px] w-full object-contain p-4 sm:p-6" loading="eager" />
            </div>
            <div className="relative mt-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-carbon/60 px-4 py-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric-light">System status</p>
                <p className="text-sm text-sub">Member program / subscription request</p>
              </div>
              <span className="rounded-full border border-electric/40 bg-electric/10 px-3 py-1 font-mono text-[11px] text-electric-light">READY</span>
            </div>
          </div>
        </div>
      </section>

      <section id="root-access-benefits" className="container-page py-14 sm:py-20">
        <p className="eyebrow">// member benefits</p>
        <h2 className="section-title mt-3">Benefícios do sistema</h2>
        <p className="section-desc">Acesso exclusivo com estética de painel, regras claras e benefícios válidos enquanto a assinatura estiver ativa.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {benefits.map((benefit, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <article key={`${benefit.title}-${i}`} className="surface surface-hover p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-electric/30 bg-electric/10 text-electric-light"><Icon size={18} /></span>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">BENEFIT_{String(i + 1).padStart(2, '0')}</p>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-base">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{benefit.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-line bg-carbon/30">
        <div className="container-page grid gap-8 py-14 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="surface relative overflow-hidden p-6 sm:p-8">
            <div className="absolute inset-0 bg-grid opacity-20 [background-size:22px_22px]" />
            <div className="relative">
              <p className="eyebrow">// mystery box</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-base sm:text-4xl">Mystery Box mensal</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-sub sm:text-base">Cada edição é uma seleção surpresa curada pela WIRED.exe. O conteúdo pode variar entre produtos, colecionáveis, adesivos e itens exclusivos da cultura geek.</p>
              <div className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
                O conteúdo da Mystery Box pode variar por edição, disponibilidade e elegibilidade da assinatura ativa. Não exibimos itens específicos não confirmados.
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {['Curadoria WIRED.exe', 'Surpresa mensal', 'Colecionáveis', 'Exclusivos para membros'].map((item, i) => (
              <div key={item} className="surface p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-electric-light">BOX_NODE_{i + 1}</p>
                <p className="mt-3 text-base font-semibold text-base">{item}</p>
                <p className="mt-2 text-sm text-muted">Composição variável, comunicada com transparência e sem promessas não confirmadas.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="root-access-subscribe" className="container-page py-14 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="surface p-6 sm:p-8">
            <p className="eyebrow">// subscription</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">Acesso por assinatura</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">Solicite seu ROOT ACCESS com consentimento explícito. No estado atual, sem integração de pagamento recorrente configurada, a solicitação é registrada como <span className="text-electric-light">PENDENTE</span> e nenhuma cobrança é realizada.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {benefits.slice(0, 4).map((b) => (
                <div key={b.title} className="rounded-xl border border-line bg-carbon/40 p-4 text-sm text-sub"><CheckCircle2 size={15} className="mb-2 text-electric-light" />{b.title}</div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-line bg-carbon/40 p-4 text-sm text-muted">
              <p className="font-medium text-base">Condições</p>
              <p className="mt-2 leading-relaxed">{config.conditions || DEFAULT_CONFIG.conditions}</p>
            </div>
          </div>

          <aside className="surface h-fit p-6 lg:sticky lg:top-28">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-electric-light">ROOT ACCESS</p>
            <p className="mt-3 font-mono text-3xl font-semibold text-base">{price}<span className="text-base text-muted">/mês</span></p>
            <p className="mt-2 text-xs text-muted">Recorrência mensal planejada. Ativação e cobrança dependem de configuração.</p>
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-carbon/40 p-4 text-sm text-sub">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 accent-[#39FF70]" />
              <span>Quero solicitar o ROOT ACCESS por {price}/mês e entendo que, sem integração de pagamento recorrente configurada, minha solicitação será registrada como pendente e não haverá cobrança automática.</span>
            </label>
            {feedback.message && (
              <div className={`mt-4 rounded-xl border p-4 text-sm ${feedback.type === 'success' ?'border-electric/30 bg-electric/10 text-sub' : 'border-red-500/30 bg-red-500/10 text-red-200'}`}>
                {feedback.message}
              </div>
            )}
            <button type="button" onClick={handleSubscribe} disabled={submitting || loading || !config.enabled} className="btn-primary mt-5 w-full disabled:opacity-50">
              {submitting ?<><Loader2 size={17} className="animate-spin" /> Registrando...</> : config.enabled ?'GET ROOT ACCESS' : 'Indisponível no momento'}
            </button>
            {!isAuthenticated && <p className="mt-3 text-xs text-muted">Você precisará entrar na sua conta para registrar a solicitação.</p>}
          </aside>
        </div>
      </section>

      <section className="container-page pb-16 sm:pb-24">
        <p className="eyebrow">// faq</p>
        <h2 className="section-title mt-3">Perguntas frequentes</h2>
        <div className="mt-8 space-y-3">
          {faq.map((item, i) => (
            <details key={`${item.question}-${i}`} className="surface group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-base">
                <span>{item.question}</span>
                <ChevronDown size={18} className="shrink-0 text-muted transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

export default RootAccessPage;

