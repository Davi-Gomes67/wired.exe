import { useEffect, useState } from 'react';
import { adminService, getErrorMessage } from '../../services/api';
import { formatDate, formatPrice } from '../../utils/format';

const STATUS = ['PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED'];
const PAY = ['NOT_PROCESSED','PAID','REFUNDED','FAILED'];

function AdminOrdersPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  const load = async () => { try { const r = await adminService.orders.list({ pageSize: 50 }); setItems(r.items || []); } catch (e) { setError(getErrorMessage(e)); } };
  useEffect(() => { load(); }, []);

  const update = async (id, payload) => {
    try {
      const r = await adminService.orders.updateStatus(id, payload);
      setItems((prev) => prev.map(o => o.id===id ? r.data : o));
      if (selected?.id===id) setSelected(r.data);
    }
    catch (e) { setError(getErrorMessage(e)); }
  };

  return (
    <div className="space-y-6">
      <div><p className="eyebrow">// admin</p><h1 className="section-title mt-2 text-3xl">Pedidos</h1></div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="surface overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="text-left text-muted border-b border-line"><tr><th className="p-3">Pedido</th><th className="p-3">Cliente</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Pagamento</th></tr></thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id} className="border-b border-line/50 cursor-pointer hover:bg-white/5" onClick={()=>setSelected(o)}>
                  <td className="p-3"><div className="font-mono text-electric-light text-xs">{o.orderCode}</div><div className="text-xs text-muted">{formatDate(o.createdAt)}</div></td>
                  <td className="p-3"><div className="text-[#D7EBDD]">{o.customerName}</div><div className="text-xs text-muted">{o.customerEmail}</div></td>
                  <td className="p-3">{formatPrice(o.totalCents)}</td>
                  <td className="p-3"><select className="input-field h-9 py-0" value={o.status} onClick={e=>e.stopPropagation()} onChange={e=>update(o.id,{status:e.target.value})}>{STATUS.map(s=><option key={s} value={s}>{s}</option>)}</select></td>
                  <td className="p-3"><select className="input-field h-9 py-0" value={o.paymentStatus} onClick={e=>e.stopPropagation()} onChange={e=>update(o.id,{paymentStatus:e.target.value})}>{PAY.map(s=><option key={s} value={s}>{s}</option>)}</select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="surface p-5 h-fit">
          <h2 className="font-semibold text-[#D7EBDD]">Detalhe</h2>
          {!selected ? <p className="mt-3 text-sm text-muted">Selecione um pedido.</p> : (
            <div className="mt-3 space-y-3 text-sm">
              <div><div className="text-muted text-xs">Código</div><div className="font-mono text-electric-light">{selected.orderCode}</div></div>
              <div><div className="text-muted text-xs">Endereço</div><div>{selected.addressLine1}, {selected.district}, {selected.city}/{selected.state}</div></div>
              <div><div className="text-muted text-xs">Itens</div>{selected.items.map(i => <div key={i.id} className="flex justify-between py-1 border-b border-line/40"><span>{i.quantity}x {i.nameSnapshot}</span><span>{formatPrice(i.unitPriceCents*i.quantity)}</span></div>)}</div>
              <div className="flex justify-between font-medium text-[#D7EBDD]"><span>Total</span><span>{formatPrice(selected.totalCents)}</span></div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default AdminOrdersPage;
