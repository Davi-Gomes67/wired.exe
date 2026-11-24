import { useEffect, useState } from 'react';
import { AlertCircle, ClipboardList, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import Price from '../components/Price';
import { formatDate } from '../utils/format';
import { getErrorMessage, ordersService } from '../services/api';

const PAYMENT_LABELS = {
  PIX_SIMULADO: 'Pix (simulação)',
  BOLETO_SIMULADO: 'Boleto (simulação)',
  CARTAO_ENTREGA_SIMULADO: 'Cartão na entrega (simulação)',
};

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    ordersService.listMine()
      .then((res) => { if (active) setOrders(res.data); })
      .catch((err) => { if (active) setError(getErrorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="container-page py-12">
        <div className="skeleton h-8 w-48" />
        <div className="mt-6 space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-28 w-full rounded-2xl" />)}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-12">
        <EmptyState icon={AlertCircle} title="Não foi possível carregar os pedidos" description={error} actionTo="/catalogo" actionLabel="Ir ao catálogo" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container-page py-12">
        <EmptyState icon={ClipboardList} title="Você ainda não tem pedidos" description="Quando finalizar uma compra autenticada, ela aparecerá aqui." actionTo="/catalogo" actionLabel="Explorar catálogo" />
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow">// pedidos</p>
      <h1 className="section-title mt-3">Meus pedidos</h1>
      <p className="section-desc">Histórico vinculado à sua conta.</p>

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <article key={order.orderCode} className="surface p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm text-electric-light">{order.orderCode}</span>
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-200">{order.status}</span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{formatDate(order.createdAt)}</p>
                <p className="mt-1 text-xs text-muted">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod} • {order.items.length} item(ns)</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <Price cents={order.totalCents} className="text-[#D7EBDD]" />
                <Link to={`/pedido/${order.orderCode}`} className="btn-subtle h-9 px-3 text-xs">Detalhes <ExternalLink size={14} /></Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default OrdersPage;
