import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CommunityPostCard from '../components/community/CommunityPostCard';
import EmptyState from '../components/EmptyState';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';
import { communityService, getErrorMessage } from '../services/api';

export default function CommunityProfilePage() {
  const { username } = useParams();
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyKey, setBusyKey] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { const res = await communityService.getProfile(username); setData(res.data); }
    catch (e) { setError(getErrorMessage(e)); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [username]); // eslint-disable-line

  const patchPost = (slug, patch) => setData((d) => d ?{ ...d, posts: { ...d.posts, items: d.posts.items.map((p) => p.slug === slug ?{ ...p, ...patch } : p) } } : d);
  const needAuth = () => { if (!isAuthenticated) { window.location.href = '/login'; return true; } return false; };
  const onLike = async (post) => { if (needAuth()) return; setBusyKey(`like:${post.slug}`); try { const r = await communityService.toggleLike(post.slug); patchPost(post.slug, { likedByViewer: r.data.liked, likesCount: r.data.likesCount }); } catch {} finally { setBusyKey(''); } };
  const onSave = async (post) => { if (needAuth()) return; setBusyKey(`save:${post.slug}`); try { const r = await communityService.toggleSave(post.slug); patchPost(post.slug, { savedByViewer: r.data.saved }); } catch {} finally { setBusyKey(''); } };

  if (loading) return <div className="container-page py-10"><div className="surface p-8 text-sm text-muted">Carregando perfil...</div></div>;
  if (error || !data) return <div className="container-page py-10"><EmptyState title="Perfil não encontrado" description={error || 'Este perfil não está disponível.'} action={<Link to="/community" className="btn-primary">Voltar</Link>} /></div>;

  const { profile, posts } = data;
  return (
    <div className="container-page py-8 sm:py-10">
      <div className="surface p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <UserAvatar src={profile.avatarUrl} name={profile.displayName || profile.username} size={80} />
          <div>
            <p className="eyebrow">WIRED ID</p>
            <h1 className="text-2xl font-bold text-base sm:text-3xl">{profile.displayName || profile.username}</h1>
            <p className="font-mono text-sm text-muted">@{profile.username}{profile.publicMemberId ?` · ${profile.publicMemberId}` : ''}</p>
            <p className="mt-1 text-sm text-muted">{(posts.meta?.total || 0) === 1 ? '1 publicação pública' : `${posts.meta?.total || 0} publicações públicas`}</p>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {posts.items?.length ? posts.items.map((post) => <CommunityPostCard key={post.id} post={post} onLike={onLike} onSave={onSave} liking={busyKey===`like:${post.slug}`} saving={busyKey===`save:${post.slug}`} />)
          : <EmptyState title="Nenhuma publica??o p?blica" description="Este usuário ainda não publicou na comunidade." />}
      </div>
    </div>
  );
}

