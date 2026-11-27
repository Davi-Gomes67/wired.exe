import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { catalogService } from '../services/api';
import { formatPrice } from '../utils/format';

export default function CatalogSearch({ value, onChange, onSubmit, onClear }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) { setSuggestions([]); return undefined; }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      catalogService.getSuggestions(q, { signal: controller.signal }).then((r) => setSuggestions(r.data || [])).catch((e) => { if (e.code !== 'ERR_CANCELED') setSuggestions([]); });
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [value]);
  useEffect(() => {
    const onDoc = (e) => { if (!wrap.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div className="relative flex-1" ref={wrap}>
      <form onSubmit={(e) => { onSubmit(e); setOpen(false); }} role="search">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} />
        <input type="search" value={value} onChange={(e) => { onChange(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="Buscar por nome, marca, categoria, descrição..." aria-label="Buscar no catálogo" className="input-field min-h-11 pl-10 pr-20" />
        {value && <button type="button" onClick={() => { onClear(); setSuggestions([]); }} className="absolute right-12 top-1/2 -translate-y-1/2 text-muted hover:text-base" aria-label="Limpar busca"><X size={15} /></button>}
        <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-panel/70 px-2 py-0.5 font-mono text-[10px] text-muted sm:inline">ENTER</span>
      </form>
      {open && suggestions.length > 0 && (
        <div className="surface absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden p-1.5">
          {suggestions.map((item) => (
            <Link key={item.id} to={`/produto/${item.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-electric/10">
              {item.imageUrl ?<img src={item.imageUrl} alt="" className="h-10 w-10 rounded-md object-contain bg-carbon/70" loading="lazy" /> : <div className="h-10 w-10 rounded-md bg-carbon/70" />}
              <div className="min-w-0 flex-1"><p className="truncate text-sm text-base">{item.name}</p><p className="truncate text-[11px] text-muted">{[item.brand, item.category?.name].filter(Boolean).join(' · ')}</p></div>
              <span className="font-mono text-xs text-electric-light">{formatPrice(item.priceCents)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

