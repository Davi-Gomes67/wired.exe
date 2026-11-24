import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock3, CreditCard, MapPin, PackageCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import Price from '../components/Price';
import { formatDate, formatPrice } from '../utils/format';
import { getErrorMessage, ordersService } from '../services/api';

const PAYMENT_LABELS = {
  PIX_SIMULADO: 'Pix (simulação)',
  BOLETO_SIMULADO: 'Boleto (simulação)',
  CARTAO_ENTREGA_SIMULADO: 'Cartão na entrega (simulação)',
};

function OrderPage() {
  const { code } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    ordersService
      .getByCode(code)
      .then((response) => { if (active) setOrder(response.data); })
      .catch((requestError) => {
        if (active) setError(requestError.response?.status === 404 ? 'Pedido não encontrado.' : getErrorMessage(requestError));
      })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [code]);

  if (loading) {
    return (
      <div className="container-page max-w-3xl py-12">
        <div className="skeleton h-8 w-1/2" />
        <div className="skeleton mt-8 h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-page py-12">
        <EmptyState icon={AlertCircle} title={error || 'Não foi possível carregar o pedido'} description="Verifique o código do pedido ou volte ao catálogo." actionTo="/catalogo" actionLabel="Voltar ao catálogo" />
      </div>
    );
  }

  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <div className="surface overflow-hidden">
        <div className="border-b border-line bg-gradient-to-r from-electric/10 to-transparent p-6 sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-electric/15 text-electric-light ring-1 ring-electric/30">
            <CheckCircle2 size={26} />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-[#D7EBDD] sm:text-3xl">Pedido registrado</h1>
          <p className="mt-2 text-sm text-muted">Seu pedido foi salvo no sistema. Nenhum pagamento foi processado.</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-line bg-carbon px-3 py-1.5 font-mono text-slate-300">{order.orderCode}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 font-medium text-amber-200">
              <Clock3 size={13} /> {order.status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Cliente</p>
            <p className="mt-2 text-sm font-medium text-[#D7EBDD]">{order.customerName}</p>
            <p className="mt-1 break-all text-sm text-muted">{order.customerEmail}</p>
            {order.customerPhone && <p className="mt-1 text-sm text-muted">{order.customerPhone}</p>}
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Registro</p>
            <p className="mt-2 text-sm text-slate-200">{formatDate(order.createdAt)}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted"><PackageCheck size={13} /> {order.paymentStatus}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted"><MapPin size={12} /> Endereço</p>
            <p className="mt-2 text-sm text-slate-300">
              {order.addressLine1}{order.addressLine2 ? `, ${order.addressLine2}` : ''} — {order.district}, {order.city}/{order.state} — CEP {order.postalCode}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted"><CreditCard size={12} /> Pagamento</p>
            <p className="mt-2 text-sm text-slate-300">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod} — sem cobrança real</p>
          </div>
        </div>

        <div className="border-t border-line p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-[#D7EBDD]">Itens do pedido</h2>
          <div className="mt-4 space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-slate-200">{item.nameSnapshot}</p>
                  <p className="mt-1 font-mono text-xs text-muted">{item.quantity}x {formatPrice(item.unitPriceCents)}</p>
                </div>
                <Price cents={item.unitPriceCents * item.quantity} size="sm" className="shrink-0 text-[#D7EBDD]" />
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-line pt-6 text-sm">
            <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatPrice(order.subtotalCents)}</span></div>
            <div className="flex justify-between"><span className="font-medium text-slate-300">Total</span><Price cents={order.totalCents} size="xl" className="text-[#D7EBDD]" /></div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link to="/pedidos" className="btn-primary flex-1">Ver histórico</Link>
        <Link to="/catalogo" className="btn-ghost flex-1">Continuar explorando</Link>
      </div>
    </div>
  );
}

export default OrderPage;
