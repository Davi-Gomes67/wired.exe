import { useEffect, useState } from 'react';
import { ArrowRight, Package, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { accountService, getErrorMessage } from '../../services/api';
import WiredIdCard, { WiredIdCardModal } from '../../components/account/WiredIdCard';
import ProductCard from '../../components/ProductCard';
import Price from '../../components/Price';
import { formatDate } from '../../utils/format';

export default function AccountOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [openCard, setOpenCard] = useState(false);
  useEffect(() => {
    let active = true;
    accountService.overview().then((r) => { if (active) setData(r.data); }).catch((e) => { if (active) setError(getErrorMessage(e)); });
    return () => { active = false; };
  }, []);

  if (error) return <div className="surface p-6 text-sm text-red-300">{error}</div>;
  if (!data) return <div className="surface p-6"><div className="skeleton h-40 w-full" /></div>;
  const root = data.rootAccess;

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">// wired id</p>
        <h1 className="section-title mt-3">Olá, {data.user.displayName || data.user.name}</h1>
        <p className="section-desc">Sua identidade digital, pedidos, favoritos e acesso ROOT.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <WiredIdCard user={data.user} rootAccess={root} onExpand={() => setOpenCard(true)} />
        <div className="surface p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">Status</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-line pb-3"><span className="text-muted">Conta</span><span className="text-electric-light">{data.user.active ?'ACTIVE' : 'INACTIVE'}</span></div>
            <div className="flex justify-between border-b border-line pb-3"><span className="text-muted">ROOT ACCESS</span><span className="text-electric-light">{root?.status || 'NOT_REQUESTED'}</span></div>
            <div className="flex justify-between border-b border-line pb-3"><span className="text-muted">Membro desde</span><span className="text-base">{formatDate(data.user.createdAt)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Member ID</span><span className="font-mono text-electric-light">{data.user.publicMemberId}</span></div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Link to="/conta/pedidos" className="btn-subtle min-h-10 justify-center text-xs">Pedidos</Link>
            <Link to="/conta/assinatura" className="btn-subtle min-h-10 justify-center text-xs">Assinatura</Link>
          </div>
        </div>
      </div>

      <section className="surface p-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-base"><Package size={16} className="mr-2 inline text-electric-light" />Pedidos recentes</h2><Link to="/conta/pedidos" className="text-xs text-electric-light hover:underline">Ver todos <ArrowRight size={12} className="inline" /></Link></div>
        {data.orders.length === 0 ?<p className="text-sm text-muted">Nenhum pedido ainda.</p> : <div className="space-y-3">{data.orders.map((o) => <Link key={o.orderCode} to={`/pedido/${o.orderCode}`} className="flex items-center justify-between rounded-lg border border-line p-3 hover:border-electric/30"><div><p className="font-mono text-xs text-electric-light">{o.orderCode}</p><p className="text-xs text-muted">{formatDate(o.createdAt)} • {o.itemCount} item(ns)</p></div><div className="text-right"><Price cents={o.totalCents} className="text-base" /><p className="text-[11px] text-muted">{o.status}</p></div></Link>)}</div>}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-base">Favoritos recentes</h2><Link to="/conta/favoritos" className="text-xs text-electric-light hover:underline">Ver todos</Link></div>
        {data.wishlist.length === 0 ?<div className="surface p-5 text-sm text-muted">Nenhum favorito salvo.</div> : <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{data.wishlist.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </section>

      <section className="surface p-5">
        <div className="flex items-center gap-2 text-base"><ShieldCheck size={16} className="text-electric-light" /><h2 className="font-semibold">ROOT ACCESS</h2></div>
        <p className="mt-2 text-sm text-muted">{root?.status === 'ACTIVE' ?'Sua assinatura ROOT ACCESS está ativa.' : root?.status === 'PENDING' ?'Sua solicitação está pendente de confirmação.' : 'Você ainda não possui assinatura ROOT ACCESS ativa.'}</p>
        <Link to="/conta/assinatura" className="btn-primary mt-4 min-h-10 px-4 text-xs inline-flex">Ver membership</Link>
      </section>
      <WiredIdCardModal open={openCard} onClose={() => setOpenCard(false)} user={data.user} rootAccess={root} />
    </div>
  );
}

