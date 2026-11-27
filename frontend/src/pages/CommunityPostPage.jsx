import { useEffect, useState } from 'react';
import { Bookmark, Flag, Heart, Loader2, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CommunityComposer from '../components/community/CommunityComposer';
import EmptyState from '../components/EmptyState';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../context/AuthContext';
import { communityService, getErrorMessage } from '../services/api';
import { resolveAssetUrl } from '../utils/asset-url';
import { COMMUNITY_CATEGORY_LABELS } from '../utils/community';

const fmt = (v) => { try { return new Date(v).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }); } catch { return ''; } };

export default function CommunityPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState('');
  const [editing, setEditing] = useState(false);
  const [reporting, setReporting] = useState(null); // 'POST' or commentId

  const load = async () => {
    setLoading(true); setError('');
    try { const [p, c] = await Promise.all([communityService.getPost(slug), communityService.listComments(slug)]); setPost(p.data); setComments(c.items || []); }
    catch (e) { setError(getErrorMessage(e)); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [slug]); // eslint-disable-line

  const requireAuth = () => { if (!isAuthenticated) { navigate('/login'); return false; } return true; };
  const onLike = async () => { if (!requireAuth() || !post) return; setBusy('like'); try { const r = await communityService.toggleLike(post.slug); setPost((p) => ({ ...p, likedByViewer: r.data.liked, likesCount: r.data.likesCount })); } catch (e) { setError(getErrorMessage(e)); } finally { setBusy(''); } };
  const onSave = async () => { if (!requireAuth() || !post) return; setBusy('save'); try { const r = await communityService.toggleSave(post.slug); setPost((p) => ({ ...p, savedByViewer: r.data.saved })); } catch (e) { setError(getErrorMessage(e)); } finally { setBusy(''); } };
  const onComment = async (e) => { e.preventDefault(); if (!requireAuth() || !comment.trim()) return; setBusy('comment'); try { const r = await communityService.addComment(post.slug, comment.trim()); setComments((prev) => [...prev, r.data]); setComment(''); setPost((p) => ({ ...p, commentsCount: (p.commentsCount || 0) + 1 })); } catch (e2) { setError(getErrorMessage(e2)); } finally { setBusy(''); } };
  const onDelete = async () => { if (!post || !window.confirm('Remover esta postagem?')) return; setBusy('delete'); try { await communityService.removePost(post.slug); navigate('/community'); } catch (e) { setError(getErrorMessage(e)); setBusy(''); } };
  const onDeleteComment = async (id) => { if (!window.confirm('Remover comentário?')) return; try { await communityService.removeComment(id); setComments((prev) => prev.filter((c) => c.id !== id)); setPost((p) => ({ ...p, commentsCount: Math.max(0, (p.commentsCount || 1) - 1) })); } catch (e) { setError(getErrorMessage(e)); } };
  const submitReport = async (targetType, targetId, reason, details) => { if (!requireAuth()) return; setBusy('report'); try { await communityService.report({ targetType, postId: targetType === 'POST' ?targetId : undefined, commentId: targetType === 'COMMENT' ?targetId : undefined, reason, details }); setReporting(null); setError(''); alert('Denúncia enviada para moderação.'); } catch (e) { setError(getErrorMessage(e)); } finally { setBusy(''); } };

  if (loading) return <div className="container-page py-10"><div className="surface p-8 text-sm text-muted">Carregando...</div></div>;
  if (error && !post) return <div className="container-page py-10"><EmptyState title="Postagem indisponível" description={error} action={<Link to="/community" className="btn-primary">Voltar à comunidade</Link>} /></div>;
  if (!post) return null;
  const mine = isAuthenticated && user && (user.role === 'ADMIN' || user.username === post.author?.username);

  return (
    <div className="container-page py-8 sm:py-10">
      {editing ?<CommunityComposer initialPost={post} onSaved={(p) => { setPost(p); setEditing(false); }} onCancel={() => setEditing(false)} /> : (
        <article className="surface overflow-hidden">
          <div className="p-5 sm:p-7">
            <p className="eyebrow">{COMMUNITY_CATEGORY_LABELS[post.category] || post.category}</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-base sm:text-4xl">{post.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
              <UserAvatar src={post.author?.avatarUrl} name={post.author?.displayName || post.author?.username} size={36} />
              <div>
                {post.author?.username ?<Link to={`/community/user/${encodeURIComponent(post.author.username)}`} className="font-medium text-base hover:text-electric-light">{post.author.displayName || post.author.username}</Link> : <span className="text-base">{post.author?.displayName || 'Usuário'}</span>}
                <div className="text-xs text-muted">@{post.author?.username || 'wired'} · {fmt(post.createdAt)}</div>
              </div>
            </div>
            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-sub sm:text-base">{post.description}</p>
            {post.details && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {Object.entries(post.details).map(([k, vals]) => Array.isArray(vals) && vals.length ?(
                  <div key={k} className="rounded-xl border border-line bg-black/15 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{k}</p>
                    <ul className="mt-2 space-y-1 text-sm text-sub">{vals.map((v, i) => <li key={i}>• {v}</li>)}</ul>
                  </div>
                ) : null)}
              </div>
            )}
          </div>
          {!!post.images?.length && <div className="grid gap-px border-y border-line bg-line sm:grid-cols-2">{post.images.map((img) => <img key={img.id} src={resolveAssetUrl(img.url)} alt={post.title} className="max-h-[480px] w-full bg-black/20 object-cover" loading="lazy" />)}</div>}
          {!!post.products?.length && (
            <div className="border-b border-line p-5 sm:p-7">
              <p className="eyebrow">Produtos relacionados</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {post.products.map((p) => <Link key={p.id} to={`/produto/${p.slug}`} className="rounded-xl border border-line bg-black/15 px-4 py-3 text-sm text-base hover:border-electric/30 hover:text-electric-light">{p.name}</Link>)}
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 p-5 sm:p-7">
            <button type="button" disabled={busy==='like'} onClick={onLike} className={`btn-subtle ${post.likedByViewer ?'text-electric-light ring-1 ring-electric/25' : ''}`}><Heart size={16} className={post.likedByViewer ?'fill-current' : ''} /> {post.likesCount || 0}</button>
            <button type="button" disabled={busy==='save'} onClick={onSave} className={`btn-subtle ${post.savedByViewer ?'text-electric-light ring-1 ring-electric/25' : ''}`}><Bookmark size={16} className={post.savedByViewer ?'fill-current' : ''} /> {post.savedByViewer ?'Salvo' : 'Salvar'}</button>
            <button type="button" onClick={() => { if (requireAuth()) setReporting('POST'); }} className="btn-subtle"><Flag size={16} /> Denunciar</button>
            {mine && <><button type="button" onClick={() => setEditing(true)} className="btn-subtle"><Pencil size={16} /> Editar</button><button type="button" disabled={busy==='delete'} onClick={onDelete} className="btn-subtle text-red-300 hover:text-red-200"><Trash2 size={16} /> Remover</button></>}
          </div>
        </article>
      )}

      {error && <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <section id="comments" className="mt-6 surface p-5 sm:p-7">
        <div className="flex items-center gap-2 text-base"><MessageSquare size={18} /><h2 className="text-lg font-semibold">Comentários ({comments.length})</h2></div>
        {isAuthenticated ?(
          <form onSubmit={onComment} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input className="field-input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Adicionar comentário..." maxLength={2000} />
            <button type="submit" disabled={busy==='comment' || !comment.trim()} className="btn-primary disabled:opacity-60">{busy==='comment' ?<Loader2 size={16} className="animate-spin" /> : 'Comentar'}</button>
          </form>
        ) : <p className="mt-4 text-sm text-muted"><Link to="/login" className="text-electric-light hover:underline">Entre</Link> para comentar.</p>}
        <div className="mt-5 space-y-4">
          {comments.length ? comments.map((c) => {
            const canRemove = isAuthenticated && (user?.role === 'ADMIN' || user?.username === c.author?.username);
            return (
              <div key={c.id} className="rounded-xl border border-line bg-black/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar src={c.author?.avatarUrl} name={c.author?.displayName || c.author?.username} size={32} />
                    <div>
                      <div className="text-sm font-medium text-base">{c.author?.displayName || c.author?.username || 'Usuário'} {c.author?.username && <span className="font-mono text-xs text-muted">@{c.author.username}</span>}</div>
                      <div className="text-xs text-muted">{fmt(c.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {isAuthenticated && <button type="button" onClick={() => setReporting(c.id)} className="rounded p-1.5 text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base"><Flag size={14} /></button>}
                    {canRemove && <button type="button" onClick={() => onDeleteComment(c.id)} className="rounded p-1.5 text-muted hover:bg-black/5 dark:bg-white/5 hover:text-red-300"><Trash2 size={14} /></button>}
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-sub">{c.body}</p>
              </div>
            );
          }) : <p className="text-sm text-muted">Nenhum comentário ainda.</p>}
        </div>
      </section>

      {reporting !== null && <ReportModal targetType={reporting === 'POST' ?'POST' : 'COMMENT'} targetId={reporting === 'POST' ?post.id : reporting} busy={busy==='report'} onClose={() => setReporting(null)} onSubmit={submitReport} />}
    </div>
  );
}

function ReportModal({ targetType, targetId, busy, onClose, onSubmit }) {
  const [reason, setReason] = useState('Conteúdo inadequado');
  const [details, setDetails] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSubmit(targetType, targetId, reason, details); }} className="surface w-full max-w-lg p-5">
        <h3 className="text-lg font-semibold text-base">Denunciar {targetType === 'POST' ?'postagem' : 'comentário'}</h3>
        <p className="mt-1 text-sm text-muted">A denúncia será enviada para moderação administrativa.</p>
        <select className="field-input mt-4" value={reason} onChange={(e) => setReason(e.target.value)}>
          {['Conteúdo inadequado','Spam','Informação enganosa','Assédio','Outro'].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <textarea className="field-input mt-3 min-h-[110px]" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Detalhes opcionais" maxLength={1000} />
        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="btn-subtle">Cancelar</button><button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">{busy ?'Enviando...' : 'Enviar denúncia'}</button></div>
      </form>
    </div>
  );
}

