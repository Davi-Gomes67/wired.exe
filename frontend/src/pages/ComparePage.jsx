import { useEffect, useState } from 'react';
import { GitCompareArrows } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import Price from '../components/Price';
import { useCompare } from '../context/CompareContext';
import { catalogService } from '../services/api';

export default function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let active = true;
    if (ids.length === 0) { setProducts([]); return undefined; }
    setLoading(true);
    Promise.all(ids.map((idOrSlug) => catalogService.getProductBySlug ? null : null));
    Promise.all(ids.map(async (id) => {
      // ids may be numbers; fetch by listing is avoided; use product by slug not stored. fallback: fetch all products and find.
      return id;
    }));
    (async () => {
      try {
        const all = await catalogService.getProducts({ pageSize: 48 });
        const byId = new Map((all.data || []).map((p) => [p.id, p]));
        // also fetch next pages if needed
        let page = 2;
        while (ids.some((id) => !byId.has(id)) && page <= (all.meta?.totalPages || 1)) {
          const res = await catalogService.getProducts({ pageSize: 48, page });
          (res.data || []).forEach((p) => byId.set(p.id, p));
          page += 1;
        }
        const found = ids.map((id) => byId.get(id)).filter(Boolean);
        const detailed = await Promise.all(found.map((p) => catalogService.getProductBySlug(p.slug).then((r) => r.data).catch(() => p)));
        if (active) setProducts(detailed);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [ids]);

  const specLabels = Array.from(new Set(products.flatMap((p) => (p.specifications || []).map((s) => s.label))));

  if (!loading && products.length < 2) {
    return <div className="container-page py-12"><EmptyState icon={GitCompareArrows} title="Comparação insuficiente" description="Selecione pelo menos 2 produtos no catálogo para comparar." actionTo="/catalogo" actionLabel="Ir ao catálogo" /></div>;
  }

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">// compare</p><h1 className="section-title mt-3">Comparar produtos</h1><p className="section-desc">Compare especificações reais. Campos ausentes aparecem como “Not informed”.</p></div>
        <button type="button" onClick={clear} className="btn-ghost min-h-11 px-4">Limpar comparação</button>
      </div>
      <div className="surface overflow-x-auto">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead><tr className="border-b border-line">{['Produto', ...products.map((p) => p.name)].map((h, i) => <th key={i} className="px-4 py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            <tr><td className="px-4 py-4 text-muted">Imagem</td>{products.map((p) => <td key={p.id} className="px-4 py-4">{p.imageUrl ?<img src={p.imageUrl} alt={p.name} className="h-20 w-20 rounded-lg object-contain bg-carbon/70" loading="lazy" /> : <div className="h-20 w-20 rounded-lg bg-carbon/70" />}</td>)}</tr>
            <tr><td className="px-4 py-4 text-muted">Marca</td>{products.map((p) => <td key={p.id} className="px-4 py-4 text-base">{p.brand || 'Not informed'}</td>)}</tr>
            <tr><td className="px-4 py-4 text-muted">Preço</td>{products.map((p) => <td key={p.id} className="px-4 py-4">{p.priceCents > 0 ?<Price cents={p.priceCents} /> : <span className="text-muted">Consulte</span>}</td>)}</tr>
            <tr><td className="px-4 py-4 text-muted">Categoria</td>{products.map((p) => <td key={p.id} className="px-4 py-4 text-base">{p.category?.name || 'Not informed'}</td>)}</tr>
            <tr><td className="px-4 py-4 text-muted">Disponibilidade</td>{products.map((p) => <td key={p.id} className="px-4 py-4"><span className={p.stock > 0 ?'text-electric-light' : 'text-red-300'}>{p.stock > 0 ?`Em estoque (${p.stock})` : 'Esgotado'}</span></td>)}</tr>
            {specLabels.map((label) => (
              <tr key={label}><td className="px-4 py-4 text-muted">{label}</td>{products.map((p) => { const spec = (p.specifications || []).find((s) => s.label === label); return <td key={p.id} className="px-4 py-4 text-base">{spec?.value || 'Not informed'}</td>; })}</tr>
            ))}
            <tr><td className="px-4 py-4 text-muted">Ações</td>{products.map((p) => <td key={p.id} className="px-4 py-4"><div className="flex gap-2"><Link to={`/produto/${p.slug}`} className="btn-ghost min-h-10 px-3 text-xs">Ver</Link><button type="button" onClick={() => remove(p.id)} className="btn-subtle min-h-10 px-3 text-xs">Remover</button></div></td>)}</tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

