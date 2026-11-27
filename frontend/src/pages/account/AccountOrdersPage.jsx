import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import Price from '../../components/Price';
import { formatDate } from '../../utils/format';
import { getErrorMessage, ordersService } from '../../services/api';

const PAYMENT_LABELS = { PIX_SIMULADO: 'Pix (simulação)', BOLETO_SIMULADO: 'Boleto (simulação)', CARTAO_ENTREGA_SIMULADO: 'Cartão na entrega (simulação)' };

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { let active = true; ordersService.listMine().then((r) => { if (active) setOrders(r.data || []); }).catch((e) => { if (active) setError(getErrorMessage(e)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  if (loading) return <div className="surface p-6"><div className="skeleton h-24 w-full" /></div>;
  if (error) return <EmptyState icon={AlertCircle} title="Não foi possível carregar os pedidos" description={error} actionTo="/catalogo" actionLabel="Ir ao catálogo" />;
  return (
    <div>
      <p className="eyebrow">// pedidos</p><h1 className="section-title mt-3">My Orders</h1><p className="section-desc">Histórico vinculado à sua conta.</p>
      <div className="mt-6 space-y-4">
        {orders.length === 0 ?<div className="surface p-5 text-sm text-muted">Você ainda não tem pedidos.</div> : orders.map((order) => (
          <article key={order.orderCode} className="surface p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-sm text-electric-light">{order.orderCode}</span><span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-200">{order.status}</span></div><p className="mt-2 text-sm text-sub">{formatDate(order.createdAt)}</p><p className="mt-1 text-xs text-muted">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod} • {order.items.length} item(ns)</p></div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end"><Price cents={order.totalCents} className="text-base" /><Link to={`/pedido/${order.orderCode}`} className="btn-subtle h-9 px-3 text-xs">Detalhes</Link></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

