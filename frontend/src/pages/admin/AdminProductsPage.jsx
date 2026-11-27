import { useEffect, useState } from 'react';
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { adminService, getErrorMessage } from '../../services/api';
import { formatPrice } from '../../utils/format';

const empty = { name: '', slug: '', description: '', brand: '', categoryId: '', priceCents: 0, compareAtCents: '', stock: 0, featured: false, imageUrl: '' };

function AdminProductsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState(null);

  const load = async () => {
    try {
      const [p, c] = await Promise.all([adminService.products.list({ pageSize: 50 }), adminService.categories.list()]);
      setItems(p.items || []); setCategories(c.data || []);
    } catch (e) { setError(getErrorMessage(e)); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError('');
    const payload = {
      ...form,
      categoryId: Number(form.categoryId),
      priceCents: Number(form.priceCents),
      stock: Number(form.stock),
      compareAtCents: form.compareAtCents === '' ?null : Number(form.compareAtCents),
      imageUrl: form.imageUrl || null,
      brand: form.brand || null,
    };
    try {
      if (editing) await adminService.products.update(editing, payload);
      else await adminService.products.create(payload);
      setForm(empty); setEditing(null); load();
    } catch (err) { setError(getErrorMessage(err)); }
  };

  const edit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, slug: p.slug, description: p.description, brand: p.brand || '', categoryId: p.categoryId, priceCents: p.priceCents, compareAtCents: p.compareAtCents ?? '', stock: p.stock, featured: p.featured, imageUrl: p.imageUrl || '' });
  };

  const remove = async (id) => {
    if (!confirm('Excluir produto?Se houver pedidos vinculados, ele ser? arquivado.')) return;
    try {
      const res = await adminService.products.remove(id);
      if (res?.data?.archived) alert(res.data.message || 'Produto arquivado.');
      load();
    } catch (e) { setError(getErrorMessage(e)); }
  };

  const upload = async (id, files) => {
    if (!files?.length) return;
    setUploadingId(id); setError('');
    try { await adminService.products.uploadImages(id, files); load(); } catch (e) { setError(getErrorMessage(e)); } finally { setUploadingId(null); }
  };

  return (
    <div className="space-y-6">
      <div><p className="eyebrow">// admin</p><h1 className="section-title mt-2 text-3xl">Produtos</h1></div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <form onSubmit={submit} className="surface p-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <h2 className="sm:col-span-2 xl:col-span-4 font-semibold text-base">{editing ?`Editar produto #${editing}` : 'Novo produto'}</h2>
        <input className="input-field" placeholder="Nome" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
        <input className="input-field" placeholder="Slug" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} />
        <input className="input-field" placeholder="Marca" value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} />
        <select className="input-field" value={form.categoryId} onChange={e=>setForm({...form,categoryId:e.target.value})} required>
          <option value="">Categoria</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input className="input-field sm:col-span-2 xl:col-span-4" placeholder="Descri??o" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required />
        <input className="input-field" type="number" min="0" placeholder="Pre?o cents" value={form.priceCents} onChange={e=>setForm({...form,priceCents:e.target.value})} required />
        <input className="input-field" type="number" min="0" placeholder="CompareAt cents" value={form.compareAtCents} onChange={e=>setForm({...form,compareAtCents:e.target.value})} />
        <input className="input-field" type="number" min="0" placeholder="Estoque" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} required />
        <input className="input-field" placeholder="Image URL" value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})} />
        <label className="flex items-center gap-2 text-sm text-sub"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})} className="accent-[#8b5cf6]" /> Destaque</label>
        <div className="flex gap-2 sm:col-span-2 xl:col-span-4">
          <button className="btn-primary"><Plus size={16} />{editing ?'Salvar' : 'Criar'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm(empty); }}>Cancelar</button>}
        </div>
      </form>

      <div className="surface overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="text-left text-muted border-b border-line"><tr><th className="p-3">Produto</th><th className="p-3">Pre?o</th><th className="p-3">Estoque</th><th className="p-3">Categoria</th><th className="p-3">Imagens</th><th className="p-3"></th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b border-line/50 align-top">
                <td className="p-3"><div className="font-medium text-base">{p.name}</div><div className="text-xs text-muted font-mono">{p.slug}</div></td>
                <td className="p-3">{formatPrice(p.priceCents)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.category?.name}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2 mb-2">{(p.images || []).map(img => (
                    <div key={img.id} className="relative group">
                      <img src={img.url} alt="" className="h-10 w-10 rounded object-cover border border-line" />
                      <button type="button" onClick={async ()=>{ try { await adminService.products.removeImage(img.id); load(); } catch (e) { setError(getErrorMessage(e)); } }} className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-base">?</button>
                    </div>
                  ))}</div>
                  <label className="btn-subtle h-8 px-2 text-xs cursor-pointer inline-flex">
                    <ImagePlus size={13} /> {uploadingId===p.id?'Enviando...':'Upload'}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e)=>{ upload(p.id, e.target.files); e.target.value = ''; }} />
                  </label>
                </td>
                <td className="p-3"><div className="flex gap-2 justify-end"><button className="btn-subtle h-8 w-8 px-0" onClick={()=>edit(p)}><Pencil size={14}/></button><button className="btn-subtle h-8 w-8 px-0 text-red-300" onClick={()=>remove(p.id)}><Trash2 size={14}/></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminProductsPage;

