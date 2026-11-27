import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import JournalCard from '../components/journal/JournalCard';
import { journalService, getErrorMessage } from '../services/api';
import { JOURNAL_CATEGORIES, JOURNAL_CATEGORY_LABELS } from '../utils/journal';
import useDocumentMeta from '../hooks/useDocumentMeta';

export default function JournalPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = (searchParams.get('category') || '').toUpperCase();
  const [data, setData] = useState({ items: [], featured: null, meta: null });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useDocumentMeta({
    title: 'WIRED Journal â€” WIRED.exe',
    description: 'Documentando tecnologia, cultura digital, hardware, retro computing e projetos DIY.',
  });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    Promise.all([
      journalService.list({ category: selectedCategory || undefined, pageSize: 12 }, controller.signal),
      journalService.categories(controller.signal),
    ]).then(([list, cats]) => {
      setData(list || { items: [], featured: null, meta: null });
      setCategories(Array.isArray(cats?.data) ? cats.data : []);
    }).catch((e) => { if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') setError(getErrorMessage(e)); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [selectedCategory]);

  const featured = data.featured || data.items?.[0] || null;
  const list = useMemo(() => {
    const items = Array.isArray(data.items) ? data.items : [];
    if (!featured) return items;
    return items.filter((a) => a.id !== featured.id);
  }, [data.items, featured]);

  const setCategory = (value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete('category'); else next.set('category', value);
    setSearchParams(next);
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="relative overflow-hidden rounded-3xl border border-line bg-panel/45 p-6 sm:p-10">
        <div className="absolute inset-0 bg-grid opacity-20 [background-size:28px_28px]" aria-hidden="true" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-electric/10 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <p className="eyebrow">// editorial archive</p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-base sm:text-5xl lg:text-6xl">WIRED JOURNAL</h1>
          <p className="mt-3 font-mono text-sm uppercase tracking-[0.24em] text-electric-light">DOCUMENTING THE DIGITAL WORLD.</p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">Tecnologia al?m do consumo: hardware, software livre, retro computing, cultura digital, DIY e experimenta??o â€” documentados com olhar editorial.</p>
        </div>
      </header>

      <section className="mt-10">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setCategory('')} className={`chip ${!selectedCategory ?'chip-active' : ''}`}>Todas</button>
          {JOURNAL_CATEGORIES.map((cat) => {
            const count = categories.find((c) => c.category === cat.value)?.count;
            return <button key={cat.value} type="button" onClick={() => setCategory(cat.value)} className={`chip ${selectedCategory === cat.value ?'chip-active' : ''}`}>{cat.label}{typeof count === 'number' ?` (${count})` : ''}</button>;
          })}
        </div>
      </section>

      {loading ?<div className="mt-10 surface p-8 text-sm text-muted">Carregando Journal...</div> : null}
      {error ?<div className="mt-10 surface border-red-500/30 p-8 text-sm text-red-300">{error}</div> : null}

      {!loading && !error && featured && (
        <section className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Link to={`/journal/${featured.slug}`} className="group relative overflow-hidden rounded-3xl border border-electric/20 bg-panel/45">
            {featured.coverImageUrl ?<img src={featured.coverImageUrl.startsWith('/uploads') ? featured.coverImageUrl : featured.coverImageUrl} alt={featured.title} className="h-full min-h-[320px] w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.01] group-hover:opacity-90" loading="lazy" /> : <div className="min-h-[320px] bg-[radial-gradient(circle_at_top,rgba(57,255,112,0.18),transparent_55%)]" />}
            <div className="absolute inset-0 bg-gradient-to-t from-void via-void/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric-light">Artigo em destaque</p>
              <h2 className="mt-3 max-w-3xl font-display text-3xl font-bold tracking-tight text-base sm:text-4xl">{featured.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sub">{featured.excerpt}</p>
            </div>
          </Link>
          <div className="surface p-6 sm:p-8">
            <p className="eyebrow">// destaque</p>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-muted">{JOURNAL_CATEGORY_LABELS[featured.category] || featured.category}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted">{featured.subtitle || featured.excerpt}</p>
            <div className="mt-6 space-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
              <div>Autor: <span className="text-sub">{featured.authorName}</span></div>
              <div>Leitura: <span className="text-sub">{Math.max(1, featured.readingTimeMinutes || 1)} min</span></div>
            </div>
            <Link to={`/journal/${featured.slug}`} className="btn-primary mt-8">Ler artigo <ArrowRight size={16} /></Link>
          </div>
        </section>
      )}

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">// ?ltimas publica??es</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-base sm:text-3xl">Arquivo digital</h2>
          </div>
        </div>
        {!loading && !error && !featured && (
          <div className="surface p-10 text-center">
            <BookOpen className="mx-auto text-electric-light" size={28} />
            <p className="mt-4 font-display text-xl font-semibold text-base">Nenhuma publica??o dispon?vel</p>
            <p className="mt-2 text-sm text-muted">O WIRED Journal ainda n?o tem artigos publicados nesta categoria.</p>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {list.map((article) => <JournalCard key={article.id} article={article} />)}
        </div>
      </section>
    </div>
  );
}
