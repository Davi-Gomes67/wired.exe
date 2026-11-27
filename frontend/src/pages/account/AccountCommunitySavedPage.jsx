import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CommunityPostCard from '../../components/community/CommunityPostCard';
import EmptyState from '../../components/EmptyState';
import { communityService, getErrorMessage } from '../../services/api';

export default function AccountCommunitySavedPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyKey, setBusyKey] = useState('');

  const load = async () => { setLoading(true); setError(''); try { const res = await communityService.listSaved({ page: 1, pageSize: 24 }); setItems(res.items || []); } catch (e) { setError(getErrorMessage(e)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const onLike = async (post) => { setBusyKey(`like:${post.slug}`); try { const r = await communityService.toggleLike(post.slug); setItems((prev) => prev.map((p) => p.slug === post.slug ?{ ...p, likedByViewer: r.data.liked, likesCount: r.data.likesCount } : p)); } catch {} finally { setBusyKey(''); } };
  const onSave = async (post) => { setBusyKey(`save:${post.slug}`); try { const r = await communityService.toggleSave(post.slug); if (!r.data.saved) setItems((prev) => prev.filter((p) => p.slug !== post.slug)); } catch {} finally { setBusyKey(''); } };

  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow">WIRED ID</p>
        <h1 className="text-2xl font-bold text-base">Saved Posts</h1>
        <p className="text-sm text-muted">Postagens da comunidade que você salvou.</p>
      </div>
      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      {loading ?<div className="surface p-6 text-sm text-muted">Carregando...</div>
        : items.length ? items.map((post) => <CommunityPostCard key={post.id} post={post} onLike={onLike} onSave={onSave} liking={busyKey===`like:${post.slug}`} saving={busyKey===`save:${post.slug}`} />)
        : <EmptyState title="Nenhuma postagem salva" description="Salve posts da comunidade para voltar depois." action={<Link to="/community" className="btn-primary">Explorar comunidade</Link>} />}
    </div>
  );
}

