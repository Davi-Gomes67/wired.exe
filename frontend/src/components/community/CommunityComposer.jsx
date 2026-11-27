import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Loader2, Send, X } from 'lucide-react';
import { communityService, getErrorMessage } from '../../services/api';
import { COMMUNITY_CATEGORIES } from '../../utils/community';

const empty = { title: '', description: '', category: 'DISCUSSION', details: { components: '', tools: '', technologies: '', steps: '', challenges: '' }, productIds: '' };
const splitLines = (v) => String(v || '').split(/\n|,/).map((s) => s.trim()).filter(Boolean).slice(0, 20);
const toForm = (post) => post ?({
  title: post.title || '', description: post.description || '', category: post.category || 'DISCUSSION',
  details: { components: (post.details?.components || []).join('\n'), tools: (post.details?.tools || []).join('\n'), technologies: (post.details?.technologies || []).join('\n'), steps: (post.details?.steps || []).join('\n'), challenges: (post.details?.challenges || []).join('\n') },
  productIds: (post.products || []).map((p) => p.id).join(', '),
}) : empty;

export default function CommunityComposer({ initialPost = null, onSaved, onCancel }) {
  const [form, setForm] = useState(toForm(initialPost));
  const [files, setFiles] = useState([]);
  const [removeImageUrls, setRemoveImageUrls] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setForm(toForm(initialPost)); setFiles([]); setRemoveImageUrls([]); setError(''); }, [initialPost?.id]);
  const needsDetails = ['SETUPS', 'PROJECTS'].includes(form.category);
  const previews = useMemo(() => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })), [files]);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const setDetail = (k, v) => setForm((s) => ({ ...s, details: { ...s.details, [k]: v } }));

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title); fd.append('description', form.description); fd.append('category', form.category);
      const productIds = splitLines(form.productIds).map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 8);
      if (productIds.length) fd.append('productIds', JSON.stringify(productIds));
      if (needsDetails) fd.append('details', JSON.stringify({ components: splitLines(form.details.components), tools: splitLines(form.details.tools), technologies: splitLines(form.details.technologies), steps: splitLines(form.details.steps), challenges: splitLines(form.details.challenges) }));
      if (removeImageUrls.length) fd.append('removeImageUrls', JSON.stringify(removeImageUrls));
      files.slice(0, 6).forEach((f) => fd.append('images', f));
      const res = initialPost ?await communityService.updatePost(initialPost.slug, fd) : await communityService.createPost(fd);
      onSaved?.(res.data);
      if (!initialPost) { setForm(empty); setFiles([]); }
    } catch (err) { setError(getErrorMessage(err)); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">{initialPost ?'Editar postagem' : 'Nova postagem'}</p>
          <h2 className="text-lg font-semibold text-base">{initialPost ?'Atualize seu conteúdo' : 'Compartilhe com a comunidade'}</h2>
        </div>
        {onCancel && <button type="button" onClick={onCancel} className="btn-subtle h-9 w-9 px-0"><X size={16} /></button>}
      </div>
      {error && <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
      <div className="mt-4 grid gap-3">
        <input className="field-input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Título" maxLength={140} required />
        <select className="field-input" value={form.category} onChange={(e) => set('category', e.target.value)}>
          {COMMUNITY_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
        <textarea className="field-input min-h-[140px]" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Descrição, contexto, resultado, dúvidas..." maxLength={6000} required />
        {needsDetails && (
          <div className="grid gap-3 rounded-xl border border-line bg-black/15 p-3 sm:grid-cols-2">
            {['components','tools','technologies','steps','challenges'].map((k) => (
              <label key={k} className="block text-xs text-muted">
                <span className="mb-1 block uppercase tracking-[0.16em]">{k}</span>
                <textarea className="field-input min-h-[88px] text-sm" value={form.details[k]} onChange={(e) => setDetail(k, e.target.value)} placeholder="Um item por linha" />
              </label>
            ))}
          </div>
        )}
        <input className="field-input" value={form.productIds} onChange={(e) => set('productIds', e.target.value)} placeholder="IDs de produtos relacionados (opcional, ex: 12, 45)" />
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base">
            <ImagePlus size={16} /> Adicionar imagens
            <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={(e) => setFiles((prev) => [...prev, ...Array.from(e.target.files || [])].slice(0, 6))} />
          </label>
          {!!initialPost?.images?.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {initialPost.images.filter((img) => !removeImageUrls.includes(img.url)).map((img) => (
                <button key={img.id} type="button" onClick={() => setRemoveImageUrls((s) => [...s, img.url])} className="rounded-md border border-line px-2 py-1 text-xs text-muted hover:text-red-300">Remover imagem {img.sortOrder + 1}</button>
              ))}
            </div>
          )}
          {!!previews.length && <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">{previews.map((p, i) => <div key={i} className="relative"><img src={p.url} alt="" className="h-20 w-full rounded-lg object-cover" /><button type="button" onClick={() => setFiles((s) => s.filter((_, idx) => idx !== i))} className="absolute right-1 top-1 rounded bg-black/70 p-1 text-white"><X size={12} /></button></div>)}</div>}
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        {onCancel && <button type="button" onClick={onCancel} className="btn-subtle">Cancelar</button>}
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">{busy ?<Loader2 size={16} className="animate-spin" /> : <Send size={16} />} {initialPost ?'Salvar' : 'Publicar'}</button>
      </div>
    </form>
  );
}

