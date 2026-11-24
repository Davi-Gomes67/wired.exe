import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { adminService, getErrorMessage } from '../../services/api';

function AdminStockPage() {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState({});
  const [error, setError] = useState('');

  const load = () => adminService.products.list({ pageSize: 50 }).then((r) => { const list = r.items || []; setItems(list); const d = {}; list.forEach(p => d[p.id]=p.stock); setDraft(d); }).catch(e=>setError(getErrorMessage(e)));
  useEffect(() => { load(); }, []);

  const save = async (id) => {
    setError('');
    const raw = draft[id];
    if (raw === '' || raw === null || raw === undefined) return setError('Informe o estoque.');
    const stock = Number(raw);
    if (!Number.isInteger(stock) || stock < 0) return setError('Estoque inválido.');
    try { await adminService.products.updateStock(id, stock); load(); } catch (e) { setError(getErrorMessage(e)); }
  };

  return (
    <div className="space-y-6">
      <div><p className="eyebrow">// admin</p><h1 className="section-title mt-2 text-3xl">Estoque</h1></div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="surface overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="text-left text-muted border-b border-line"><tr><th className="p-3">Produto</th><th className="p-3">Atual</th><th className="p-3">Novo estoque</th><th className="p-3"></th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-line/50">
                <td className="p-3 text-[#D7EBDD]">{p.name}</td>
                <td className="p-3"><span className={p.stock <= 5 ? 'text-amber-300' : 'text-slate-300'}>{p.stock}</span></td>
                <td className="p-3"><input className="input-field h-9 w-28" type="number" min="0" max="999999" value={draft[p.id] ?? p.stock} onChange={(e)=>setDraft({...draft,[p.id]:e.target.value})} /></td>
                <td className="p-3"><button className="btn-subtle h-9 px-3" onClick={()=>save(p.id)}><Save size={14}/> Salvar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminStockPage;
