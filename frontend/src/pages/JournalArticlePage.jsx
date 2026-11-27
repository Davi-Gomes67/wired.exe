import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import JournalBlocks from '../components/journal/JournalBlocks';
import JournalCard from '../components/journal/JournalCard';
import ProductCard from '../components/ProductCard';
import { getErrorMessage, journalService } from '../services/api';
import { formatJournalDate, JOURNAL_CATEGORY_LABELS, readingTimeLabel } from '../utils/journal';
import { resolveAssetUrl } from '../utils/asset-url';
import useDocumentMeta from '../hooks/useDocumentMeta';

export default function JournalArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    journalService.getBySlug(slug, controller.signal)
      .then((res) => setArticle(res?.data || null))
      .catch((e) => { if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') setError(getErrorMessage(e)); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [slug]);

  useDocumentMeta({
    title: article ?`${article.title} â€” WIRED Journal` : 'WIRED Journal â€” WIRED.exe',
    description: article?.excerpt || 'Artigo do WIRED Journal.',
    image: resolveAssetUrl(article?.coverImageUrl),
    type: 'article',
  });

  if (loading) return <div className="container-page py-12"><div className="surface p-8 text-sm text-muted">Carregando artigo...</div></div>;
  if (error || !article) return <div className="container-page py-12"><div className="surface p-8 text-sm text-red-300">{error || 'Artigo n?o encontrado.'}</div><Link to="/journal" className="btn-ghost mt-4 inline-flex">Voltar ao Journal</Link></div>;

  const cover = resolveAssetUrl(article.coverImageUrl);

  return (
    <div className="container-page py-10 sm:py-14">
      <Link to="/journal" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted transition hover:text-electric-light"><ArrowLeft size={14} /> Voltar ao Journal</Link>

      <article className="mx-auto mt-6 max-w-4xl">
        <header className="border-b border-line pb-8">
          <p className="eyebrow">{JOURNAL_CATEGORY_LABELS[article.category] || article.category}</p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-base sm:text-5xl">{article.title}</h1>
          {article.subtitle ?<p className="mt-4 max-w-3xl text-lg leading-relaxed text-sub">{article.subtitle}</p> : null}
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            <span className="inline-flex items-center gap-2"><User size={13} /> {article.authorName}</span>
            <span className="inline-flex items-center gap-2"><Calendar size={13} /> {formatJournalDate(article.publishedAt)}</span>
            <span className="inline-flex items-center gap-2"><Clock size={13} /> {readingTimeLabel(article.readingTimeMinutes)}</span>
          </div>
        </header>

        {cover ?<div className="mt-8 overflow-hidden rounded-3xl border border-line bg-carbon/50"><img src={cover} alt={article.title} className="max-h-[560px] w-full object-cover" loading="eager" /></div> : null}

        <div className="mt-10">
          <JournalBlocks blocks={article.content} />
        </div>
      </article>

      {Array.isArray(article.relatedProducts) && article.relatedProducts.length > 0 && (
        <section className="mx-auto mt-16 max-w-6xl">
          <p className="eyebrow">// relacionados do cat?logo</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-base">Produtos relacionados</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {article.relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {Array.isArray(article.relatedArticles) && article.relatedArticles.length > 0 && (
        <section className="mx-auto mt-16 max-w-6xl">
          <p className="eyebrow">// continue lendo</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-base">Artigos relacionados</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {article.relatedArticles.map((a) => <JournalCard key={a.id} article={a} compact />)}
          </div>
        </section>
      )}
    </div>
  );
}
