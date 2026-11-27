import { useEffect, useState } from 'react';
import { Eye, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { adminService, catalogService, getErrorMessage } from '../../services/api';
import { JOURNAL_CATEGORIES } from '../../utils/journal';

const empty = { title: '', slug: '', subtitle: '', excerpt: '', category: 'HARDWARE', authorName: '', coverImageUrl: '', status: 'DRAFT', featured: false, contentText: '', relatedProductIds: [] };

const textToBlocks = (text) => String(text || '').split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean).map((text) => ({ type: 'paragraph', text }));
const blocksToText = (blocks) => Array.isArray(blocks) ? blocks.map((b) => {
  if (b.type === 'list') return (b.items || []).map((i) => `- ${i}`).join('\n');
  if (b.type === 'divider') return '---';
  if (b.type === 'image') return `[image] ${b.url || ''}`;
  if (b.type === 'link') return `[link] ${b.text || ''} -> ${b.href || ''}`;
  return b.text || '';
  }).filter(Boolean).join('\n\n') : '';

function parseContentText(text) {
  const chunks = String(text || '').split(/\n\s*\n/).map((c) => c.trim()).filter(Boolean);
  const blocks = [];
  for (const chunk of chunks) {
    if (chunk === '---') { blocks.push({ type: 'divider' }); continue; }
    if (chunk.startsWith('## ')) { blocks.push({ type: 'heading', text: chunk.slice(3).trim() }); continue; }
    if (chunk.startsWith('### ')) { blocks.push({ type: 'subheading', text: chunk.slice(4).trim() }); continue; }
    if (chunk.startsWith('> ')) { blocks.push({ type: 'quote', text: chunk.replace(/^>\s?/gm, '').trim() }); continue; }
    if (chunk.startsWith('```')) { blocks.push({ type: 'code', text: chunk.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim() }); continue; }
    if (/^(- |\* |\d+\. )/.test(chunk)) {
      const ordered = /^\d+\. /.test(chunk);
      const items = chunk.split('\n').map((l) => l.replace(/^(- |\* |\d+\. )/, '').trim()).filter(Boolean);
      blocks.push({ type: 'list', ordered, items });
      continue;
    }
    if (chunk.toLowerCase().startsWith('[image]')) {
      const url = chunk.replace(/^\[image\]\s*/i, '').trim();
      if (url) blocks.push({ type: 'image', url, alt: '' });
      continue;
    }
    if (chunk.toLowerCase().startsWith('[link]')) {
      const m = chunk.match(/^\[link\]\s*(.*?)\s*->\s*(\S+)$/i);
      if (m) { blocks.push({ type: 'link', text: m[1].trim(), href: m[2].trim() }); continue; }
    }
    blocks.push({ type: 'paragraph', text: chunk });
  }
  return blocks.length ? blocks : textToBlocks(text);
}

export default function AdminJournalPage() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [j, p] = await Promise.all([adminService.journal.list({ pageSize: 50 }), catalogService.getProducts({ pageSize: 100 })]);
      setItems(j.items || []); setProducts(p.data || []);
    } catch (e) { setError(getErrorMessage(e)); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    const payload = {
      title: form.title, slug: form.slug || undefined, subtitle: form.subtitle || null, excerpt: form.excerpt,
      category: form.category, authorName: form.authorName, coverImageUrl: form.coverImageUrl || null,
      status: form.status, featured: !!form.featured, content: parseContentText(form.contentText),
      relatedProductIds: form.relatedProductIds.map(Number).filter(Boolean),
    };
    try {
      if (editing) await adminService.journal.update(editing, payload); else await adminService.journal.create(payload);
      setForm(empty); setEditing(null); await load();
    } catch (e) { setError(getErrorMessage(e)); } finally { setLoading(false); }
  };

  const edit = (a) => {
    setEditing(a.id);
    setForm({ title: a.title, slug: a.slug, subtitle: a.subtitle || '', excerpt: a.excerpt || '', category: a.category, authorName: a.authorName || '', coverImageUrl: a.coverImageUrl || '', status: a.status, featured: !!a.featured, contentText: blocksToText(a.content), relatedProductIds: (a.relatedProducts || []).map((rp) => rp.product?.id).filter(Boolean) });
  };

  const remove = async (id) => {
    if (!confirm('Excluir artigo?Esta a??o remove o artigo do Journal.')) return;
    setError('');
    try { await adminService.journal.remove(id); await load(); } catch (e) { setError(getErrorMessage(e)); }
  };

  const changeStatus = async (id, status) => { try { await adminService.journal.updateStatus(id, status); await load(); } catch (e) { setError(getErrorMessage(e)); } };
  const uploadCover = async (id, file) => { if (!file) return; try { await adminService.journal.uploadCover(id, file); await load(); } catch (e) { setError(getErrorMessage(e)); } };

  const toggleRelated = (id) => {
    setForm((f) => {
      const has = f.relatedProductIds.includes(id);
      return { ...f, relatedProductIds: has ? f.relatedProductIds.filter((x) => x !== id) : [...f.relatedProductIds, id].slice(0, 8) };
    });
  };

  return (
    <div>
      <p className="eyebrow">// admin</p>
      <h1 className="section-title mt-2">Journal / Articles</h1>
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <form onSubmit={submit} className="surface mt-6 grid gap-3 p-5 lg:grid-cols-2">
        <input className="input-field" placeholder="T?tulo" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="input-field" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        <input className="input-field lg:col-span-2" placeholder="Subt?tulo / resumo curto" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        <textarea className="input-field min-h-20 lg:col-span-2" placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} required />
        <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{JOURNAL_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
        <input className="input-field" placeholder="Autor" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} required />
        <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="DRAFT">DRAFT</option><option value="PUBLISHED">PUBLISHED</option><option value="ARCHIVED">ARCHIVED</option></select>
        <label className="flex items-center gap-2 text-sm text-sub"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Destaque</label>
        <input className="input-field lg:col-span-2" placeholder="Cover image URL (/uploads/journal/...)" value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} />
        <div className="lg:col-span-2">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Conte?do (blocos simples: par?grafo, ## heading, ### subheading, {'>'} quote, - lista, 1. lista, ```c?digo```, --- divisor, [image] /url, [link] texto -&gt; /url)</p>
          <textarea className="input-field min-h-[260px] font-mono text-xs leading-6" value={form.contentText} onChange={(e) => setForm({ ...form, contentText: e.target.value })} required />
        </div>
        <div className="lg:col-span-2">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Produtos relacionados (at? 8)</p>
          <div className="grid max-h-44 gap-2 overflow-auto rounded-xl border border-line bg-carbon/30 p-3 sm:grid-cols-2">
            {products.map((p) => <label key={p.id} className="flex items-center gap-2 text-xs text-sub"><input type="checkbox" checked={form.relatedProductIds.includes(p.id)} onChange={() => toggleRelated(p.id)} /> <span className="truncate">{p.name}</span></label>)}
          </div>
        </div>
        <div className="flex gap-2 lg:col-span-2">
          <button className="btn-primary" disabled={loading}><Plus size={16} /> {editing ?'Salvar' : 'Criar'}</button>
          {editing && <button type="button" className="btn-ghost" onClick={() => { setEditing(null); setForm(empty); }}>Cancelar</button>}
          {editing && <a href={`/journal/${form.slug}`} target="_blank" rel="noreferrer" className="btn-ghost"><Eye size={16} /> Pr?via</a>}
        </div>
      </form>

      <div className="surface mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3">T?tulo</th><th className="px-4 py-3">Categoria</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Destaque</th><th className="px-4 py-3">A??es</th></tr></thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-b border-line/50 last:border-0">
                <td className="px-4 py-3"><div className="font-medium text-sub">{a.title}</div><div className="font-mono text-[11px] text-muted">/{a.slug}</div></td>
                <td className="px-4 py-3 text-muted">{a.category}</td>
                <td className="px-4 py-3"><select className="input-field h-9 py-1 text-xs" value={a.status} onChange={(e) => changeStatus(a.id, e.target.value)}><option value="DRAFT">DRAFT</option><option value="PUBLISHED">PUBLISHED</option><option value="ARCHIVED">ARCHIVED</option></select></td>
                <td className="px-4 py-3 text-muted">{a.featured ?'Sim' : 'N?o'}</td>
                <td className="px-4 py-3"><div className="flex gap-1">
                  <label className="btn-subtle h-8 w-8 cursor-pointer px-0" title="Upload capa"><Upload size={14} /><input type="file" accept="image/*" className="hidden" onChange={(e) => uploadCover(a.id, e.target.files?.[0])} /></label>
                  <button className="btn-subtle h-8 w-8 px-0" onClick={() => edit(a)} aria-label="Editar"><Pencil size={14} /></button>
                  <button className="btn-subtle h-8 w-8 px-0 text-red-300 hover:text-red-200" onClick={() => remove(a.id)} aria-label="Excluir"><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">Nenhum artigo. Crie o primeiro rascunho.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
