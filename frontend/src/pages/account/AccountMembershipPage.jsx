import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { accountService, getErrorMessage, rootAccessService } from '../../services/api';
import { formatDate } from '../../utils/format';
import Price from '../../components/Price';

export default function AccountMembershipPage() {
  const [sub, setSub] = useState(null);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([accountService.rootAccess().catch(() => ({ data: null })), rootAccessService.getPublic().catch(() => ({ data: null }))])
      .then(([s, c]) => { if (active) { setSub(s.data); setConfig(c.data); } })
      .catch((e) => { if (active) setError(getErrorMessage(e)); });
    return () => { active = false; };
  }, []);
  if (error) return <div className="surface p-6 text-sm text-red-300">{error}</div>;
  const active = sub?.status === 'ACTIVE';
  return (
    <div>
      <p className="eyebrow">// membership</p><h1 className="section-title mt-3">Membership</h1><p className="section-desc">Integração WIRED ID + ROOT ACCESS.</p>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="surface p-5">
          <div className="flex items-center gap-2 text-base"><Shield size={16} className="text-electric-light" /><h2 className="font-semibold">Status da assinatura</h2></div>
          {sub ?(
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-line pb-3"><span className="text-muted">Status</span><span className={active ?'text-electric-light' : 'text-amber-300'}>{sub.status}</span></div>
              <div className="flex justify-between border-b border-line pb-3"><span className="text-muted">Plano</span><span className="text-base">ROOT ACCESS</span></div>
              <div className="flex justify-between border-b border-line pb-3"><span className="text-muted">Preço</span><Price cents={sub.priceCents} className="text-base" /></div>
              <div className="flex justify-between border-b border-line pb-3"><span className="text-muted">Aceite</span><span className="text-base">{formatDate(sub.acceptedTermsAt)}</span></div>
              {sub.expiresAt && <div className="flex justify-between border-b border-line pb-3"><span className="text-muted">Renovação</span><span className="text-base">{formatDate(sub.expiresAt)}</span></div>}
              <div className="flex justify-between"><span className="text-muted">Atualizado</span><span className="text-base">{formatDate(sub.updatedAt)}</span></div>
            </div>
          ) : <p className="mt-4 text-sm text-muted">Nenhuma solicitação encontrada para esta conta.</p>}
        </section>
        <section className="surface p-5">
          <h2 className="font-semibold text-base">{active ?'ROOT ACCESS ativo' : 'Conheça o ROOT ACCESS'}</h2>
          <p className="mt-2 text-sm text-muted">{config?.description || 'Acesso premium WIRED.exe.'}</p>
          {config?.priceCents && <p className="mt-4 font-mono text-lg text-electric-light"><Price cents={config.priceCents} /> <span className="text-xs text-muted">/ mês</span></p>}
          <ul className="mt-4 space-y-2 text-sm text-muted">{(config?.benefits || []).slice(0, 4).map((b, i) => <li key={i} className="border-b border-line/60 pb-2">{b.title || b}</li>)}</ul>
          {!active && <Link to="/root-access" className="btn-primary mt-5 inline-flex min-h-10 px-4 text-xs">Conhecer / Solicitar</Link>}
          {active && <p className="mt-5 text-xs text-electric-light">Benefícios disponíveis conforme configuração ativa no backend.</p>}
        </section>
      </div>
    </div>
  );
}

