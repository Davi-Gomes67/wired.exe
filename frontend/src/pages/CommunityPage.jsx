import { useEffect, useState } from 'react';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import CommunityComposer from '../components/community/CommunityComposer';
import CommunityPostCard from '../components/community/CommunityPostCard';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { communityService, getErrorMessage } from '../services/api';
import { COMMUNITY_CATEGORIES } from '../utils/community';

export default function CommunityPage() {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('latest');
  const [composeOpen, setComposeOpen] = useState(false);
  const [busyKey, setBusyKey] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { const res = await communityService.listPosts({ q: q || undefined, category: category || undefined, sort, page: 1, pageSize: 20 }); setItems(res.items || []); setMeta(res.meta || null); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [category, sort]); // eslint-disable-line

  const onSearch = (e) => { e.preventDefault(); load(); };
  const updateItem = (slug, patch) => setItems((prev) => prev.map((p) => p.slug === slug ?{ ...p, ...patch } : p));
  const needAuth = () => { if (!isAuthenticated) { window.location.href = '/login'; return true; } return false; };

  const onLike = async (post) => {
    if (needAuth()) return;
    setBusyKey(`like:${post.slug}`);
    try { const res = await communityService.toggleLike(post.slug); updateItem(post.slug, { likedByViewer: res.data.liked, likesCount: res.data.likesCount }); } catch (e) { setError(getErrorMessage(e)); } finally { setBusyKey(''); }
  };
  const onSave = async (post) => {
    if (needAuth()) return;
    setBusyKey(`save:${post.slug}`);
    try { const res = await communityService.toggleSave(post.slug); updateItem(post.slug, { savedByViewer: res.data.saved }); } catch (e) { setError(getErrorMessage(e)); } finally { setBusyKey(''); }
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">WIRED COMMUNITY</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-base sm:text-4xl">Comunidade</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">Setups, projetos, modding, retro tech e discussões técnicas integradas ao seu WIRED ID.</p>
        </div>
        {isAuthenticated ?(
          user?.username ?<button type="button" onClick={() => setComposeOpen((v) => !v)} className="btn-primary"><Plus size={16} /> Nova postagem</button>
          : <Link to="/conta/configuracoes" className="btn-primary">Definir username para postar</Link>
        ) : <Link to="/login" className="btn-primary">Entrar para participar</Link>}
      </div>

      {composeOpen && user?.username && <div className="mt-6"><CommunityComposer onSaved={(post) => { setComposeOpen(false); setItems((prev) => [post, ...prev]); }} onCancel={() => setComposeOpen(false)} /></div>}

      <div className="mt-6 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="surface h-fit p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">Filtros</p>
          <form onSubmit={onSearch} className="mt-3 flex gap-2">
            <input className="field-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar posts..." />
            <button type="submit" className="btn-subtle h-11 w-11 px-0"><Search size={16} /></button>
          </form>
          <div className="mt-4 grid gap-1">
            <button type="button" onClick={() => setCategory('')} className={`rounded-lg px-3 py-2 text-left text-sm ${!category ?'bg-electric/10 text-electric-light' : 'text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base'}`}>Todas</button>
            {COMMUNITY_CATEGORIES.map((c) => (
              <button key={c.key} type="button" onClick={() => setCategory(c.key)} className={`rounded-lg px-3 py-2 text-left text-sm ${category === c.key ?'bg-electric/10 text-electric-light' : 'text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base'}`}>
                <span className="block">{c.label}</span>
                <span className="block text-[11px] text-muted">{c.description}</span>
              </button>
            ))}
          </div>
          <label className="mt-4 block text-xs text-muted">
            <span className="mb-1 flex items-center gap-1 uppercase tracking-[0.16em]"><SlidersHorizontal size={12} /> Ordem</span>
            <select className="field-input" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="latest">Mais recentes</option>
              <option value="top">Mais curtidos</option>
            </select>
          </label>
        </aside>

        <section className="space-y-4">
          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
          {loading ?<div className="surface p-8 text-sm text-muted">Carregando feed...</div>
            : items.length ? items.map((post) => <CommunityPostCard key={post.id} post={post} onLike={onLike} onSave={onSave} liking={busyKey===`like:${post.slug}`} saving={busyKey===`save:${post.slug}`} />)
            : <EmptyState title="O feed ainda está silencioso" description="Quando a comunidade publicar setups, projetos, mods ou discussões, eles aparecerão aqui. Seja o primeiro a compartilhar algo real." action={isAuthenticated && user?.username ?<button type="button" className="btn-primary" onClick={() => setComposeOpen(true)}><Plus size={16} /> Criar postagem</button> : undefined} />}
          {meta && meta.total > 0 && <p className="text-center text-xs text-muted">{meta.total} {meta.total === 1 ? 'postagem' : 'postagens'}</p>}
        </section>
      </div>
    </div>
  );
}

