import { useEffect, useState } from 'react';
import { adminService, getErrorMessage } from '../../services/api';

const postStatuses = ['PUBLISHED','HIDDEN','REMOVED'];
const commentStatuses = ['VISIBLE','HIDDEN','REMOVED'];
const reportStatuses = ['OPEN','REVIEWED','DISMISSED','ACTION_TAKEN'];
const fmt = (v) => { try { return new Date(v).toLocaleString('pt-BR'); } catch { return ''; } };

export default function AdminCommunityPage() {
  const [tab, setTab] = useState('reports');
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [p, c, r] = await Promise.all([adminService.community.listPosts({ page:1, pageSize:20 }), adminService.community.listComments({ page:1, pageSize:20 }), adminService.community.listReports({ page:1, pageSize:30 })]);
      setPosts(p.items || []); setComments(c.items || []); setReports(r.items || []);
    } catch (e) { setError(getErrorMessage(e)); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const setPostStatus = async (id, status) => { setBusy(`post:${id}`); try { const res = await adminService.community.updatePostStatus(id, { status }); setPosts((prev) => prev.map((p) => p.id === id ?{ ...p, status: res.data.status } : p)); } catch (e) { setError(getErrorMessage(e)); } finally { setBusy(''); } };
  const setCommentStatus = async (id, status) => { setBusy(`comment:${id}`); try { const res = await adminService.community.updateCommentStatus(id, { status }); setComments((prev) => prev.map((c) => c.id === id ?{ ...c, status: res.data.status } : c)); } catch (e) { setError(getErrorMessage(e)); } finally { setBusy(''); } };
  const setReport = async (id, status) => { setBusy(`report:${id}`); try { const res = await adminService.community.updateReport(id, { status }); setReports((prev) => prev.map((r) => r.id === id ?{ ...r, status: res.data.status } : r)); } catch (e) { setError(getErrorMessage(e)); } finally { setBusy(''); } };

  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="text-2xl font-bold text-base">Community Moderation</h1>
        <p className="text-sm text-muted">Modere postagens, comentários e denúncias da WIRED COMMUNITY.</p>
      </div>
      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
      <div className="flex flex-wrap gap-2">
        {['reports','posts','comments'].map((t) => <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-lg px-3 py-2 text-sm ${tab===t ?'bg-electric/15 text-base ring-1 ring-electric/30' : 'text-muted hover:bg-black/5 dark:bg-white/5'}`}>{t === 'reports' ?`Denúncias (${reports.length})` : t === 'posts' ?`Posts (${posts.length})` : `Comentários (${comments.length})`}</button>)}
      </div>
      {loading ?<div className="surface p-6 text-sm text-muted">Carregando...</div> : tab === 'reports' ?(
        <div className="space-y-3">{reports.map((r) => (
          <div key={r.id} className="surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-base">#{r.id} · {r.targetType} · <span className="text-muted">{r.status}</span></div>
              <select className="field-input h-9 w-auto py-0 text-sm" value={r.status} disabled={busy===`report:${r.id}`} onChange={(e) => setReport(r.id, e.target.value)}>{reportStatuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            </div>
            <p className="mt-2 text-sm text-sub"><span className="text-muted">Motivo:</span> {r.reason}</p>
            {r.details && <p className="text-sm text-muted">{r.details}</p>}
            <p className="mt-2 text-xs text-muted">Reporter: {r.reporter?.username || r.reporter?.email} · {fmt(r.createdAt)}</p>
            {r.post && <p className="mt-1 text-xs text-muted">Post: {r.post.title} ({r.post.status})</p>}
            {r.comment && <p className="mt-1 text-xs text-muted">Comentário: {r.comment.body?.slice(0, 120)} ({r.comment.status})</p>}
          </div>
        ))}{!reports.length && <div className="surface p-6 text-sm text-muted">Nenhuma denúncia.</div>}</div>
      ) : tab === 'posts' ?(
        <div className="space-y-3">{posts.map((p) => (
          <div key={p.id} className="surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div><div className="font-medium text-base">{p.title}</div><div className="text-xs text-muted">@{p.author?.username || p.author?.email} · {p.category} · {fmt(p.createdAt)} · {p._count?.reports || 0} denúncias</div></div>
              <select className="field-input h-9 w-auto py-0 text-sm" value={p.status} disabled={busy===`post:${p.id}`} onChange={(e) => setPostStatus(p.id, e.target.value)}>{postStatuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-sub">{p.description}</p>
          </div>
        ))}{!posts.length && <div className="surface p-6 text-sm text-muted">Nenhum post.</div>}</div>
      ) : (
        <div className="space-y-3">{comments.map((c) => (
          <div key={c.id} className="surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-muted">@{c.author?.username || c.author?.email} em {c.post?.title} · {fmt(c.createdAt)}</div>
              <select className="field-input h-9 w-auto py-0 text-sm" value={c.status} disabled={busy===`comment:${c.id}`} onChange={(e) => setCommentStatus(c.id, e.target.value)}>{commentStatuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            </div>
            <p className="mt-2 text-sm text-sub">{c.body}</p>
          </div>
        ))}{!comments.length && <div className="surface p-6 text-sm text-muted">Nenhum comentário.</div>}</div>
      )}
    </div>
  );
}

