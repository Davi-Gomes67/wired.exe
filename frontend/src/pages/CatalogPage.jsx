import { useEffect, useMemo, useState } from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import ActiveFilters from '../components/ActiveFilters';
import CatalogFilterPanel from '../components/CatalogFilterPanel';
import CatalogSearch from '../components/CatalogSearch';
import FilterDrawer from '../components/FilterDrawer';
import ProductGrid from '../components/ProductGrid';
import useDebounce from '../hooks/useDebounce';
import { catalogService, getErrorMessage } from '../services/api';

const SORTS = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price-asc', label: 'Menor preço' },
  { value: 'price-desc', label: 'Maior preço' },
  { value: 'name', label: 'Ordem alfabética' },
];

export default function CatalogPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'newest';
  const brand = searchParams.get('brand') || '';
  const availability = searchParams.get('availability') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const category = slug || searchParams.get('category') || '';
  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebounce(searchInput, 350);

  useEffect(() => { setSearchInput(q); }, [q]);
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    const current = searchParams.get('q') || '';
    if (debouncedSearch.trim() === current) return;
    if (debouncedSearch.trim()) next.set('q', debouncedSearch.trim()); else next.delete('q');
    next.delete('page');
    setSearchParams(next, { replace: true });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { catalogService.getCategories().then((r) => setCategories(r.data || [])).catch(() => setCategories([])); }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    catalogService.getProducts({ category: category || undefined, q: q || undefined, sort, brand: brand || undefined, availability: availability || undefined, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined, page, pageSize: 12 }, { signal: controller.signal })
      .then((r) => { setProducts(r.data || []); setMeta(r.meta || { page: 1, totalPages: 1, total: 0 }); })
      .catch((e) => { if (e.code !== 'ERR_CANCELED') setError(getErrorMessage(e)); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [category, q, sort, brand, availability, minPrice, maxPrice, page]);

  const setParams = (patch, replace = false) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => { if (v) next.set(k, v); else next.delete(k); });
    if (!('page' in patch)) next.delete('page');
    setSearchParams(next, { replace });
  };

  const clearAll = () => { setSearchInput(''); setSearchParams(slug ? { category: slug } : {}, { replace: true }); };
  const activeCategory = categories.find((c) => c.slug === category);
  const chips = useMemo(() => {
    const list = [];
    if (q) list.push({ key: 'q', label: `Busca: ${q}`, clear: () => { setSearchInput(''); setParams({ q: '' }); } });
    if (category && !slug) list.push({ key: 'category', label: `Categoria: ${activeCategory?.name || category}`, clear: () => setParams({ category: '' }) });
    if (brand) list.push({ key: 'brand', label: `Marca: ${brand}`, clear: () => setParams({ brand: '' }) });
    if (availability) list.push({ key: 'availability', label: availability === 'in-stock' ?'Em estoque' : 'Esgotado', clear: () => setParams({ availability: '' }) });
    if (minPrice || maxPrice) list.push({ key: 'price', label: `Preço: ${minPrice ?`R$${minPrice}` : '...'} - ${maxPrice ?`R$${maxPrice}` : '...'}`, clear: () => setParams({ minPrice: '', maxPrice: '' }) });
    return list;
  }, [q, category, slug, brand, availability, minPrice, maxPrice, activeCategory]);

  const filterValues = { category, brand, availability, minPrice, maxPrice };
  const onFilterChange = (next) => {
    const patch = { brand: next.brand, availability: next.availability, minPrice: next.minPrice, maxPrice: next.maxPrice };
    if (!slug) patch.category = next.category;
    setParams(patch);
  };

  const filterPanel = <CatalogFilterPanel values={filterValues} categories={categories} onChange={onFilterChange} onClear={clearAll} />;
  const hasFilters = chips.length > 0;

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-7">
        <p className="eyebrow">// product database / {activeCategory?.slug || 'all-systems'}</p>
        <h1 className="section-title mt-3">PRODUCT DATABASE</h1>
        <p className="section-desc">Explore o catálogo tecnológico da WIRED.exe.</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted/80">TECHNOLOGY • GEEK CULTURE • ELECTRONICS</p>
      </div>

      <div className="surface mb-6 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <CatalogSearch value={searchInput} onChange={setSearchInput} onSubmit={(e) => { e.preventDefault(); setParams({ q: searchInput.trim() }); }} onClear={() => { setSearchInput(''); setParams({ q: '' }); }} />
          <div className="flex gap-2">
            <label className="relative flex-1 sm:w-52">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <select value={sort} onChange={(e) => setParams({ sort: e.target.value === 'newest' ?'' : e.target.value })} aria-label="Ordenar produtos" className="input-field min-h-11 appearance-none pl-10 pr-8">
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
            <button type="button" onClick={() => setDrawerOpen(true)} className="btn-ghost min-h-11 px-4 lg:hidden"><Filter size={16} />Filtros</button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <p className="font-mono text-xs text-muted"><span className="text-electric-light">{meta.total}</span> produtos encontrados</p>
          {q && <p className="text-xs text-muted">Busca: <span className="text-base">"{q}"</span></p>}
        </div>
        {chips.length > 0 && <div className="mt-3 border-t border-line pt-3"><ActiveFilters chips={chips} onRemove={(chip) => chip.clear()} onClear={clearAll} /></div>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block"><div className="surface sticky top-24 p-4">{filterPanel}</div></aside>
        <div>
          <ProductGrid products={products} loading={loading} error={error} highlightQuery={q} emptyTitle={hasFilters ?'Nenhum produto encontrado com os filtros selecionados.' : 'Nenhum produto encontrado'} emptyDescription={hasFilters ?'Remova alguns filtros ou limpe a busca para ver mais resultados.' : 'Tente outra busca ou escolha uma categoria diferente.'} />
          {meta.totalPages > 1 && !loading && !error && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button type="button" onClick={() => setParams({ page: String(page - 1) }, true)} disabled={page <= 1} className="btn-ghost min-h-11 px-4 disabled:opacity-40">Anterior</button>
              <span className="font-mono text-sm text-base/90">{page} / {meta.totalPages}</span>
              <button type="button" onClick={() => setParams({ page: String(page + 1) }, true)} disabled={page >= meta.totalPages} className="btn-ghost min-h-11 px-4 disabled:opacity-40">Próxima</button>
            </div>
          )}
        </div>
      </div>

      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>{filterPanel}</FilterDrawer>
    </div>
  );
}

