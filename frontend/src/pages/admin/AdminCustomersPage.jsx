import { useEffect, useState } from 'react';
import { adminService, getErrorMessage } from '../../services/api';
import { formatDate, formatPrice } from '../../utils/format';

function AdminCustomersPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  const load = () => adminService.customers.list({ pageSize: 50 }).then(r => setItems(r.items || [])).catch(e => setError(getErrorMessage(e)));
  useEffect(() => { load(); }, []);

  const open = async (id) => { try { const r = await adminService.customers.get(id); setSelected(r.data); } catch (e) { setError(getErrorMessage(e)); } };
  const toggle = async (c) => { try { await adminService.customers.updateStatus(c.id, !c.active); load(); if (selected?.id===c.id) open(c.id); } catch (e) { setError(getErrorMessage(e)); } };

  return (
    <div className="space-y-6">
      <div><p className="eyebrow">// admin</p><h1 className="section-title mt-2 text-3xl">Clientes</h1></div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="surface overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="text-left text-muted border-b border-line"><tr><th className="p-3">Cliente</th><th className="p-3">Pedidos</th><th className="p-3">Cadastro</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-line/50 hover:bg-black/5 dark:bg-white/5 cursor-pointer" onClick={()=>open(c.id)}>
                  <td className="p-3"><div className="text-base">{c.name}</div><div className="text-xs text-muted">{c.email}</div></td>
                  <td className="p-3">{c._count?.orders ?? 0}</td>
                  <td className="p-3 text-muted">{formatDate(c.createdAt)}</td>
                  <td className="p-3"><button className={`btn-subtle h-8 px-3 text-xs ${c.active?'text-emerald-300':'text-red-300'}`} onClick={(e)=>{e.stopPropagation(); toggle(c);}}>{c.active?'Ativo':'Inativo'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="surface p-5 h-fit">
          <h2 className="font-semibold text-base">Detalhe</h2>
          {!selected ?<p className="mt-3 text-sm text-muted">Selecione um cliente.</p> : (
            <div className="mt-3 space-y-3 text-sm">
              <div><div className="text-base font-medium">{selected.name}</div><div className="text-muted">{selected.email}</div></div>
              <div><div className="text-xs text-muted mb-1">Endere?os</div>{selected.addresses?.length ?selected.addresses.map(a=><div key={a.id} className="text-xs text-sub py-1 border-b border-line/40">{a.addressLine1}, {a.city}/{a.state}</div>) : <div className="text-xs text-muted">Nenhum.</div>}</div>
              <div><div className="text-xs text-muted mb-1">Pedidos</div>{selected.orders?.length ?selected.orders.map(o=><div key={o.id} className="flex justify-between text-xs py-1 border-b border-line/40"><span className="font-mono text-electric-light">{o.orderCode}</span><span>{formatPrice(o.totalCents)}</span></div>) : <div className="text-xs text-muted">Nenhum.</div>}</div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default AdminCustomersPage;

