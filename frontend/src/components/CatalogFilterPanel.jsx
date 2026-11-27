import { useEffect, useState } from 'react';
import { SlidersHorizontal, Tag, X } from 'lucide-react';
import { catalogService } from '../services/api';

export default function CatalogFilterPanel({ values, onChange, onClear, categories = [] }) {
  const [brands, setBrands] = useState([]);
  const [min, setMin] = useState(values.minPrice || '');
  const [max, setMax] = useState(values.maxPrice || '');
  useEffect(() => { catalogService.getBrands().then((r) => setBrands(r.data || [])).catch(() => setBrands([])); }, []);
  useEffect(() => { setMin(values.minPrice || ''); setMax(values.maxPrice || ''); }, [values.minPrice, values.maxPrice]);
  const set = (key, value) => onChange({ ...values, [key]: value });
  const applyPrice = () => onChange({ ...values, minPrice: min.trim(), maxPrice: max.trim() });

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Departamento</p>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm text-base/90"><input type="radio" name="cat" checked={!values.category} onChange={() => set('category', '')} className="accent-[#00FF41]" />Todos</label>
          {categories.map((cat) => (
            <label key={cat.slug} className="flex items-center gap-2 text-sm text-base/90"><input type="radio" name="cat" checked={values.category === cat.slug} onChange={() => set('category', cat.slug)} className="accent-[#00FF41]" />{cat.name}</label>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Marca</label>
        <div className="relative"><Tag size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><select value={values.brand || ''} onChange={(e) => set('brand', e.target.value)} className="input-field min-h-11 appearance-none pl-9 pr-8"><option value="">Todas as marcas</option>{brands.map((b) => <option key={b} value={b}>{b}</option>)}</select></div>
      </div>
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Disponibilidade</p>
        <div className="space-y-1.5">
          {[['', 'Todos'], ['in-stock', 'Em estoque'], ['out-of-stock', 'Esgotado']].map(([v, l]) => (
            <label key={v || 'all'} className="flex items-center gap-2 text-sm text-base/90"><input type="radio" name="avail" checked={(values.availability || '') === v} onChange={() => set('availability', v)} className="accent-[#00FF41]" />{l}</label>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Faixa de preço (R$)</p>
        <div className="flex gap-2"><input type="number" min="0" inputMode="decimal" value={min} onChange={(e) => setMin(e.target.value)} placeholder="Mín." className="input-field" /><input type="number" min="0" inputMode="decimal" value={max} onChange={(e) => setMax(e.target.value)} placeholder="Máx." className="input-field" /></div>
        <div className="mt-2 flex gap-2"><button type="button" onClick={applyPrice} className="btn-ghost min-h-10 flex-1 px-3 text-xs">Aplicar</button>{(values.minPrice || values.maxPrice) && <button type="button" onClick={() => { setMin(''); setMax(''); onChange({ ...values, minPrice: '', maxPrice: '' }); }} className="btn-subtle min-h-10 px-3 text-xs"><X size={13} />Limpar</button>}</div>
      </div>
      <button type="button" onClick={onClear} className="btn-subtle w-full justify-center text-xs uppercase tracking-wider"><SlidersHorizontal size={14} />CLEAR ALL</button>
    </div>
  );
}

