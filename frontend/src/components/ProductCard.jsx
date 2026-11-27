import { useMemo, useState } from 'react';
import { Check, Cpu, Gamepad2, GitCompareArrows, Headphones, Heart, Keyboard, MemoryStick, Package, Shirt, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import Price from './Price';

const ICONS = {
  'hardware-lab': Cpu, 'geek-wear': Shirt, peripherals: Keyboard, 'digital-culture': Headphones,
  components: MemoryStick, 'retro-computing': Gamepad2, 'starter-packs': Package,
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const highlight = (text, query) => {
  if (!query || !text) return text;
  const parts = String(text).split(new RegExp(`(${escapeRegExp(query)})`, 'ig'));
  return parts.map((part, i) => part.toLowerCase() === query.toLowerCase() ?<mark key={i} className="bg-electric/20 text-electric-light rounded px-0.5">{part}</mark> : part);
};

export default function ProductCard({ product, highlightQuery = '' }) {
  const { addItem } = useCart();
  const { has: hasWish, toggle: toggleWish } = useWishlist();
  const { has: hasCompare, toggle: toggleCompare } = useCompare();
  const [added, setAdded] = useState(false);
  const Icon = ICONS[product.category?.slug] || Package;
  const hasOffer = product.compareAtCents && product.compareAtCents > product.priceCents;
  const discount = hasOffer ?Math.round(((product.compareAtCents - product.priceCents) / product.compareAtCents) * 100) : 0;
  const outOfStock = product.stock <= 0;
  const inStock = !outOfStock && product.stock <= 5;
  const priceOnRequest = product.priceCents <= 0;
  const wished = hasWish(product.id);
  const compared = hasCompare(product.id);

  const handleAdd = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (outOfStock || priceOnRequest) return;
    addItem(product, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="surface surface-hover group flex h-full flex-col overflow-hidden">
      <Link to={`/produto/${product.slug}`} className="relative aspect-[4/3] overflow-hidden bg-carbon/80">
        <div className="absolute inset-0 bg-grid opacity-30 [background-size:24px_24px]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-carbon via-transparent to-transparent" />
        {product.imageUrl ?(
          <img src={product.imageUrl} alt={product.name} loading="lazy" className="relative h-full w-full object-contain p-5 transition duration-500 group-hover:scale-[1.04]" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-electric/25"><Icon size={72} strokeWidth={1} /></div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {outOfStock && <span className="rounded-md bg-red-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-base">Esgotado</span>}
          {!outOfStock && hasOffer && <span className="rounded-md bg-electric px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-void">-{discount}%</span>}
          {product.featured && !outOfStock && <span className="rounded-md border border-electric/50 bg-void/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-electric-light backdrop-blur">Destaque</span>}
        </div>
        <div className="absolute right-3 top-3 flex gap-2">
          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWish(product); }} className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border backdrop-blur transition ${wished ?'border-electric/50 bg-electric/15 text-electric-light' : 'border-line bg-void/55 text-muted hover:text-electric-light'}`} aria-label={wished ?`Remover ${product.name} dos favoritos` : `Adicionar ${product.name} aos favoritos`} title={wished ?'Remover favorito' : 'Favoritar'}>
            <Heart size={15} fill={wished ?'currentColor' : 'none'} />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-light/80">{product.category?.name || 'WIRED'}</p>
          {inStock && <p className="font-mono text-[10px] uppercase tracking-wider text-amber-300">últimas un.</p>}
        </div>
        <Link to={`/produto/${product.slug}`} className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-base transition group-hover:text-electric-light">{highlight(product.name, highlightQuery)}</Link>
        {product.brand && <p className="mt-1 text-xs text-muted">{highlight(product.brand, highlightQuery)}</p>}
        <p className="mt-2 line-clamp-2 min-h-[2.25rem] text-xs leading-relaxed text-muted">{highlight(product.description, highlightQuery)}</p>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3">
            {priceOnRequest ?<p className="text-sm font-medium text-muted">Consulte</p> : (
              <div className="flex items-end gap-2">
                <Price cents={product.priceCents} size="lg" className="text-base" />
                {hasOffer && <span className="pb-0.5 font-mono text-xs text-muted line-through">{formatPrice(product.compareAtCents)}</span>}
              </div>
            )}
            <div className="flex items-center gap-2">
              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(product.id); }} className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${compared ?'border-electric/50 bg-electric/15 text-electric-light' : 'border-line bg-panel/60 text-muted hover:border-electric/40 hover:text-electric-light'}`} aria-label={compared ?`Remover ${product.name} da comparação` : `Comparar ${product.name}`} title={compared ?'Remover comparação' : 'Comparar'}>
                <GitCompareArrows size={15} />
              </button>
              <button type="button" onClick={handleAdd} disabled={outOfStock || priceOnRequest} className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${added ?'border-electric/50 bg-electric/15 text-electric-light' : 'border-line bg-panel/60 text-muted hover:border-electric/40 hover:text-electric-light'} disabled:cursor-not-allowed disabled:opacity-40`} aria-label={added ?`${product.name} adicionado ao carrinho` : `Adicionar ${product.name} ao carrinho`} title={added ?'Adicionado' : 'Adicionar ao carrinho'}>
                {added ?<Check size={15} /> : <ShoppingCart size={15} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

