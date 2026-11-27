import { Bookmark, Heart, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserAvatar from '../UserAvatar';
import { resolveAssetUrl } from '../../utils/asset-url';
import { COMMUNITY_CATEGORY_LABELS } from '../../utils/community';

const time = (v) => { try { return new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return ''; } };

export default function CommunityPostCard({ post, onLike, onSave, liking, saving, children }) {
  const author = post?.author || {};
  const cover = resolveAssetUrl(post?.images?.[0]?.url);
  return (
    <article className="surface overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar src={author.avatarUrl} name={author.displayName || author.username || 'Usuário'} size={40} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {author.username ?<Link to={`/community/user/${encodeURIComponent(author.username)}`} className="truncate text-sm font-semibold text-base hover:text-electric-light">{author.displayName || author.username}</Link> : <span className="text-sm font-semibold text-base">{author.displayName || 'Usuário'}</span>}
              {author.username && <span className="font-mono text-[11px] text-muted">@{author.username}</span>}
            </div>
            <p className="text-xs text-muted">{COMMUNITY_CATEGORY_LABELS[post.category] || post.category} · {time(post.createdAt)}</p>
          </div>
        </div>
        {children}
      </div>
      <Link to={`/community/${encodeURIComponent(post.slug)}`} className="block px-4 sm:px-5">
        <h3 className="text-lg font-semibold tracking-tight text-base hover:text-electric-light">{post.title}</h3>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-sub/90">{post.description?.length > 260 ?`${post.description.slice(0, 260)}...` : post.description}</p>
      </Link>
      {cover && (
        <Link to={`/community/${encodeURIComponent(post.slug)}`} className="mt-4 block border-y border-line bg-black/20">
          <img src={cover} alt={post.title} className="max-h-[420px] w-full object-cover" loading="lazy" />
        </Link>
      )}
      <div className="flex flex-wrap items-center gap-2 p-4 sm:px-5">
        <button type="button" disabled={liking} onClick={() => onLike?.(post)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${post.likedByViewer ?'bg-electric/10 text-electric-light ring-1 ring-electric/25' : 'text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base'} disabled:opacity-60`}>
          <Heart size={16} className={post.likedByViewer ?'fill-current' : ''} /> {post.likesCount || 0}
        </button>
        <Link to={`/community/${encodeURIComponent(post.slug)}#comments`} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-black/5 dark:bg-white/5 hover:text-base">
          <MessageSquare size={16} /> {post.commentsCount || 0}
        </Link>
        <button type="button" disabled={saving} onClick={() => onSave?.(post)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${post.savedByViewer ?'bg-electric/10 text-electric-light ring-1 ring-electric/25' : 'text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base'} disabled:opacity-60`}>
          <Bookmark size={16} className={post.savedByViewer ?'fill-current' : ''} /> {post.savedByViewer ?'Salvo' : 'Salvar'}
        </button>
      </div>
    </article>
  );
}

