import { useEffect, useState } from 'react';
import { AlertCircle, DollarSign, Package, ShoppingBag, Users } from 'lucide-react';
import { adminService, getErrorMessage } from '../../services/api';
import { formatPrice } from '../../utils/format';

function Kpi({ icon: Icon, label, value, sub }) {
  return (
    <div className="surface p-4">
      <div className="flex items-center justify-between text-muted"><span className="text-xs uppercase tracking-wider">{label}</span><Icon size={16} className="text-electric-light" /></div>
      <p className="mt-3 text-2xl font-bold text-[#D7EBDD]">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    adminService.dashboard().then((r) => { if (active) setData(r.data); }).catch((e) => { if (active) setError(getErrorMessage(e)); });
    return () => { active = false; };
  }, []);

  if (error) return <div className="surface p-5 text-red-300 flex gap-2"><AlertCircle size={18} />{error}</div>;
  if (!data) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>;

  const { kpis } = data;
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">// admin</p>
        <h1 className="section-title mt-2 text-3xl">Dashboard</h1>
        <p className="section-desc">Indicadores calculados a partir de pedidos reais registrados no banco.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={DollarSign} label="Receita" value={formatPrice(kpis.totalRevenueCents)} sub="Total de pedidos registrados" />
        <Kpi icon={ShoppingBag} label="Pedidos" value={kpis.ordersCount} sub={`${kpis.pendingOrders} pendentes`} />
        <Kpi icon={Users} label="Clientes" value={kpis.customersCount} sub="Contas CUSTOMER" />
        <Kpi icon={Package} label="Produtos" value={kpis.productsCount} sub={`${kpis.lowStockCount} com estoque baixo`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="surface p-5">
          <h2 className="font-semibold text-[#D7EBDD]">Vendas por dia (7 dias)</h2>
          <div className="mt-4 space-y-3">
            {data.salesByDay.map((d) => {
              const max = Math.max(1, ...data.salesByDay.map((x) => x.revenueCents));
              return (
                <div key={d.date}>
                  <div className="mb-1 flex justify-between text-xs text-muted"><span>{d.date}</span><span>{d.orders} ped. / {formatPrice(d.revenueCents)}</span></div>
                  <div className="h-2 rounded-full bg-white/5"><div className="h-2 rounded-full bg-electric" style={{ width: `${(d.revenueCents / max) * 100}%` }} /></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="surface p-5">
          <h2 className="font-semibold text-[#D7EBDD]">Pedidos por status</h2>
          <div className="mt-4 space-y-2">
            {data.ordersByStatus.length === 0 && <p className="text-sm text-muted">Nenhum pedido registrado ainda.</p>}
            {data.ordersByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between rounded-lg border border-line bg-carbon/40 px-3 py-2 text-sm">
                <span className="text-slate-300">{s.status}</span>
                <span className="text-muted">{s.count} • {formatPrice(s.revenueCents)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="surface p-5">
          <h2 className="font-semibold text-[#D7EBDD]">Top produtos (receita real)</h2>
          <div className="mt-4 space-y-2">
            {data.topProducts.length === 0 && <p className="text-sm text-muted">Sem vendas registradas.</p>}
            {data.topProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b border-line/50 py-2 last:border-0">
                <span className="text-slate-200 truncate mr-3">{p.name}</span>
                <span className="text-muted shrink-0">{p.quantity}x • {formatPrice(p.revenueCents)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="surface p-5">
          <h2 className="font-semibold text-[#D7EBDD]">Estoque baixo</h2>
          <div className="mt-4 space-y-2">
            {data.lowStock.length === 0 && <p className="text-sm text-muted">Nenhum produto com estoque baixo.</p>}
            {data.lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b border-line/50 py-2 last:border-0">
                <span className="text-slate-200 truncate mr-3">{p.name}</span>
                <span className={p.stock === 0 ? 'text-red-300' : 'text-amber-300'}>{p.stock} un.</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
