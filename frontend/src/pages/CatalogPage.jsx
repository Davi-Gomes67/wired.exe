import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import CatalogFilters from '../components/CatalogFilters';
import CategoryFilter from '../components/CategoryFilter';
import ProductGrid from '../components/ProductGrid';
import { catalogService, getErrorMessage } from '../services/api';

function CatalogPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'newest';
  const brand = searchParams.get('brand') || '';
  const offer = searchParams.get('offer') === 'true';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => setSearchInput(search), [search]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  useEffect(() => {
    catalogService
      .getCategories()
      .then((response) => setCategories(response.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    catalogService
      .getProducts(
        {
          category: slug || undefined,
          q: search || undefined,
          sort,
          brand: brand || undefined,
          offer: offer ? 'true' : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          page,
          pageSize: 12,
        },
        controller.signal,
      )
      .then((response) => {
        setProducts(response.data || []);
        setMeta(response.meta || { page: 1, totalPages: 1, total: 0 });
      })
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') setError(getErrorMessage(requestError));
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [slug, search, sort, brand, offer, minPrice, maxPrice, page]);

  const activeCategory = categories.find((category) => category.slug === slug);

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-7">
        <p className="eyebrow">// products / {activeCategory ? activeCategory.slug : 'all-systems'}</p>
        <h1 className="section-title mt-3">{activeCategory ? activeCategory.name : 'Products'}</h1>
        <p className="section-desc">{activeCategory?.description || 'The internet is part of reality. Hardware for your projects. Culture for your identity.'}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted/80">TECHNOLOGY • GEEK CULTURE • ELECTRONICS</p>
      </div>
      <div className="space-y-5">
        <CategoryFilter categories={categories} activeSlug={slug || ''} />
        <CatalogFilters
          search={searchInput}
          onSearchChange={setSearchInput}
          onSearchSubmit={(event) => {
            event.preventDefault();
            setParam('q', searchInput.trim());
          }}
          sort={sort}
          onSortChange={(value) => setParam('sort', value === 'newest' ? '' : value)}
          total={meta.total}
          brand={brand}
          onBrandChange={(value) => setParam('brand', value)}
          offer={offer}
          onOfferChange={(value) => setParam('offer', value ? 'true' : '')}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={(min, max) => {
            const next = new URLSearchParams(searchParams);
            if (min) next.set('minPrice', min); else next.delete('minPrice');
            if (max) next.set('maxPrice', max); else next.delete('maxPrice');
            next.delete('page');
            setSearchParams(next);
          }}
        />
      </div>

      <div className="mt-7">
        <ProductGrid
          products={products}
          loading={loading}
          error={error}
          emptyTitle="Nada por aqui ainda"
          emptyDescription="Tente outra busca ou escolha uma categoria diferente."
        />
      </div>

      {meta.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setParam('page', String(page - 1))}
            disabled={page <= 1}
            className="btn-ghost px-3 disabled:opacity-40"
            aria-label="Página anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-mono text-sm text-[#D7EBDD]/90">
            {page} / {meta.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setParam('page', String(page + 1))}
            disabled={page >= meta.totalPages}
            className="btn-ghost px-3 disabled:opacity-40"
            aria-label="Próxima página"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export default CatalogPage;
