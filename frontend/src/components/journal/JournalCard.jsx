import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveAssetUrl } from '../../utils/asset-url';
import { formatJournalDate, JOURNAL_CATEGORY_LABELS, readingTimeLabel } from '../../utils/journal';

export default function JournalCard({ article, compact = false }) {
  const cover = resolveAssetUrl(article?.coverImageUrl);
  return (
    <article className={`group overflow-hidden rounded-2xl border border-line bg-panel/55 transition duration-300 hover:border-electric/35 hover:shadow-glow ${compact ?'' : 'h-full'}`}>
      <Link to={`/journal/${article.slug}`} className="block">
        <div className="relative overflow-hidden border-b border-line bg-carbon/60">
          {cover ?(
            <img src={cover} alt={article.title} loading="lazy" className={`w-full object-cover transition duration-500 group-hover:scale-[1.02] ${compact ?'aspect-[16/10]' : 'aspect-[16/10] sm:aspect-[16/9]'}`} />
          ) : (
            <div className={`flex w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(57,255,112,0.14),transparent_55%)] ${compact ?'aspect-[16/10]' : 'aspect-[16/10] sm:aspect-[16/9]'}`}>
              <span className="font-mono text-xs uppercase tracking-[0.28em] text-electric-light/70">WIRED JOURNAL</span>
            </div>
          )}
          <div className="absolute left-4 top-4 rounded-full border border-electric/25 bg-void/75 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-electric-light backdrop-blur">{JOURNAL_CATEGORY_LABELS[article.category] || article.category}</div>
        </div>
      </Link>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
          <span>{formatJournalDate(article.publishedAt)}</span>
          <span aria-hidden="true">/</span>
          <span>{readingTimeLabel(article.readingTimeMinutes)}</span>
        </div>
        <Link to={`/journal/${article.slug}`} className="mt-3 block font-display text-xl font-bold tracking-tight text-base transition hover:text-electric-light sm:text-2xl">{article.title}</Link>
        <p className="mt-3 text-sm leading-relaxed text-muted">{article.excerpt}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line/70 pt-4">
          <span className="text-xs text-muted">Por {article.authorName}</span>
          <Link to={`/journal/${article.slug}`} className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.16em] text-electric-light transition hover:text-base">Ler <ArrowRight size={14} /></Link>
        </div>
      </div>
    </article>
  );
}
