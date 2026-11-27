import { useEffect, useState } from 'react';
import { Save, Star } from 'lucide-react';
import { adminService, getErrorMessage } from '../../services/api';

function AdminFeaturedPage() {
  const [data, setData] = useState({ featured: [], candidates: [] });
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const r = await adminService.featured.get();
      setData(r.data);
      setSelected(new Set((r.data.featured || []).map((p) => p.id)));
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const save = async () => {
    setSaving(true); setError(''); setOk('');
    try {
      const r = await adminService.featured.update([...selected]);
      setData(r.data);
      setSelected(new Set((r.data.featured || []).map((p) => p.id)));
      setOk('Destaques salvos.');
    } catch (e) { setError(getErrorMessage(e)); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">// admin</p><h1 className="section-title mt-2 text-3xl">Destaques</h1><p className="section-desc">Selecione produtos ativos para aparecer como destaque na loja.</p></div>
        <button className="btn-primary" onClick={save} disabled={saving || loading}><Save size={16} />{saving ?'Salvando...' : 'Salvar destaques'}</button>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {ok && <p className="text-sm text-emerald-300">{ok}</p>}
      <div className="surface p-5">
        <h2 className="font-semibold text-base flex items-center gap-2"><Star size={16} className="text-electric-light" /> Selecionados ({selected.size})</h2>
        {loading ?<p className="mt-3 text-sm text-muted">Carregando...</p> : selected.size === 0 ?<p className="mt-3 text-sm text-muted">Nenhum destaque selecionado. A home usar? fallback autom?tico.</p> : (
          <div className="mt-3 flex flex-wrap gap-2">{data.candidates.filter(p => selected.has(p.id)).map(p => <span key={p.id} className="rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-xs text-base">{p.name}</span>)}</div>
        )}
      </div>
      <div className="surface overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="text-left text-muted border-b border-line"><tr><th className="p-3">Destaque</th><th className="p-3">Produto</th><th className="p-3">Categoria</th><th className="p-3">Estoque</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {!loading && data.candidates.length === 0 && <tr><td className="p-4 text-muted" colSpan="5">Nenhum produto ativo dispon?vel.</td></tr>}
            {data.candidates.map((p) => (
              <tr key={p.id} className="border-b border-line/50">
                <td className="p-3"><input type="checkbox" className="accent-[#8b5cf6]" checked={selected.has(p.id)} onChange={() => toggle(p.id)} /></td>
                <td className="p-3 text-base">{p.name}</td>
                <td className="p-3 text-muted">{p.category?.name || '-'}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.archived ?<span className="text-amber-300">Arquivado</span> : <span className="text-emerald-300">Ativo</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminFeaturedPage;

