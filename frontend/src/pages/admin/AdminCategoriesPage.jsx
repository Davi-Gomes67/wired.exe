import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { adminService, getErrorMessage } from '../../services/api';

const empty = { name: '', slug: '', description: '' };

function AdminCategoriesPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => adminService.categories.list().then((r) => setItems(r.data)).catch((e) => setError(getErrorMessage(e)));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editing) await adminService.categories.update(editing, form);
      else await adminService.categories.create(form);
      setForm(empty); setEditing(null); load();
    } catch (err) { setError(getErrorMessage(err)); }
  };

  const remove = async (id) => {
    if (!confirm('Excluir categoria?')) return;
    try { await adminService.categories.remove(id); load(); } catch (err) { setError(getErrorMessage(err)); }
  };

  return (
    <div className="space-y-6">
      <div><p className="eyebrow">// admin</p><h1 className="section-title mt-2 text-3xl">Categorias</h1></div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="surface p-5 space-y-3 h-fit">
          <h2 className="font-semibold text-[#D7EBDD]">{editing ? 'Editar categoria' : 'Nova categoria'}</h2>
          <input className="input-field" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input-field" placeholder="Slug (opcional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <textarea className="input-field min-h-24" placeholder="Descrição" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-2">
            <button className="btn-primary"><Plus size={16} />{editing ? 'Salvar' : 'Criar'}</button>
            {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm(empty); }}>Cancelar</button>}
          </div>
        </form>
        <div className="surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted border-b border-line"><tr><th className="p-3">Nome</th><th className="p-3">Slug</th><th className="p-3">Produtos</th><th className="p-3"></th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-line/50">
                  <td className="p-3 text-[#D7EBDD]">{c.name}</td><td className="p-3 text-muted font-mono text-xs">{c.slug}</td><td className="p-3">{c.productCount}</td>
                  <td className="p-3 flex gap-2 justify-end">
                    <button className="btn-subtle h-8 w-8 px-0" onClick={() => { setEditing(c.id); setForm({ name: c.name, slug: c.slug, description: c.description || '' }); }}><Pencil size={14} /></button>
                    <button className="btn-subtle h-8 w-8 px-0 text-red-300" onClick={() => remove(c.id)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminCategoriesPage;
