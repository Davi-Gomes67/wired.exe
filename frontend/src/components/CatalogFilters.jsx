import { useEffect, useState } from 'react';
import { SlidersHorizontal, Tag, X } from 'lucide-react';
import { catalogService } from '../services/api';
import SearchBar from './SearchBar';

export default function CatalogFilters({
  search,
  onSearchChange,
  onSearchSubmit,
  sort,
  onSortChange,
  total,
  brand = '',
  onBrandChange,
  offer = false,
  onOfferChange,
  minPrice = '',
  maxPrice = '',
  onPriceChange,
}) {
  const [brands, setBrands] = useState([]);
  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);

  useEffect(() => {
    catalogService.getBrands().then((res) => setBrands(res.data || [])).catch(() => setBrands([]));
  }, []);

  useEffect(() => { setMinInput(minPrice); }, [minPrice]);
  useEffect(() => { setMaxInput(maxPrice); }, [maxPrice]);

  const applyPrice = () => onPriceChange?.(minInput.trim(), maxInput.trim());
  const clearPrice = () => { setMinInput(''); setMaxInput(''); onPriceChange?.('', ''); };
  const hasPrice = minPrice || maxPrice;

  return (
    <div className="surface flex flex-col gap-3 p-3 sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex-1">
          <SearchBar value={search} onChange={onSearchChange} onSubmit={onSearchSubmit} />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
          <label className="relative">
            <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <select
              value={sort}
              onChange={(event) => onSortChange(event.target.value)}
              aria-label="Ordenar produtos"
              className="input-field min-h-11 appearance-none pl-10 pr-8 sm:w-44"
            >
              <option value="newest">Mais recentes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="name">Nome A-Z</option>
            </select>
          </label>

          <label className="relative">
            <Tag className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <select
              value={brand}
              onChange={(event) => onBrandChange?.(event.target.value)}
              aria-label="Filtrar por marca"
              className="input-field min-h-11 appearance-none pl-10 pr-8 sm:w-44"
            >
              <option value="">Todas as marcas</option>
              {brands.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => onOfferChange?.(!offer)}
            className={`chip col-span-2 sm:col-span-1 ${offer ?'chip-active' : ''}`}
            aria-pressed={offer}
          >
            Ofertas
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-3 sm:flex-row sm:items-center">
        <span className="text-xs font-medium text-muted">Faixa de preço (R$)</span>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="number"
            min="0"
            step="1"
            inputMode="decimal"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            placeholder="Mín."
            aria-label="Preço mínimo"
            className="input-field sm:w-32"
          />
          <span className="hidden text-muted sm:block">—</span>
          <input
            type="number"
            min="0"
            step="1"
            inputMode="decimal"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            placeholder="Máx."
            aria-label="Preço máximo"
            className="input-field sm:w-32"
          />
          <button type="button" onClick={applyPrice} className="btn-ghost min-h-11 px-4 sm:w-auto">
            Aplicar
          </button>
          {hasPrice && (
            <button type="button" onClick={clearPrice} className="btn-subtle min-h-11 text-muted">
              <X size={14} /> Limpar preço
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
        <span className="font-mono">{total} produtos</span>
        {(brand || offer || search || hasPrice) && <span className="text-muted/80">Filtros ativos</span>}
      </div>
    </div>
  );
}
