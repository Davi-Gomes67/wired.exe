import { useState } from 'react';
import { Cpu, Gamepad2, Headphones, Keyboard, MemoryStick, Package, Shirt, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';
import Price from './Price';

const ICONS = {
  'hardware-lab': Cpu, 'geek-wear': Shirt, peripherals: Keyboard,
  'digital-culture': Headphones, components: MemoryStick, 'retro-computing': Gamepad2, 'starter-packs': Package,
};

export default function ProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const categorySlug = product.category?.slug;
  const FallbackIcon = ICONS[categorySlug] || Cpu;
  const hasOffer = product.compareAtCents && product.compareAtCents > product.priceCents;
  const discount = hasOffer ? Math.round((1 - product.priceCents / product.compareAtCents) * 100) : 0;
  const outOfStock = product.stock === 0;
  const inStock = product.stock > 0;
  const priceOnRequest = !product.priceCents || product.priceCents <= 0;

  return (
    <Link to={`/produto/${product.slug}`} className="surface surface-hover group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-carbon/80">
        <div className="absolute inset-0 bg-grid opacity-30 [background-size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-transparent" />
        {FallbackIcon && (
          <div className="absolute inset-0 flex items-center justify-center text-electric/25">
            <FallbackIcon size={72} strokeWidth={0.9} />
          </div>
        )}
        {product.imageUrl && !imageFailed && (
          <img src={product.imageUrl} alt={product.name} loading="lazy" onError={() => setImageFailed(true)}
            className="relative h-full w-full object-contain p-5 transition duration-500 group-hover:scale-[1.04]" />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {outOfStock && <span className="rounded-md bg-red-500/15 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-red-300 ring-1 ring-red-500/30">Esgotado</span>}
          {hasOffer && !outOfStock && <span className="rounded-md bg-electric px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-void">-{discount}%</span>}
          {product.featured && !outOfStock && !hasOffer && <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-electric-light ring-1 ring-electric/30"><Sparkles size={10} /> Destaque</span>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-electric-light/80">{product.brand || product.category?.name || 'WIRED.exe'}</p>
          <span className="text-[10px] text-muted">{product.stock} un.</span>
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-[#D7EBDD] transition group-hover:text-electric-light sm:text-[0.95rem]">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{product.description}</p>
        <div className="mt-auto pt-4">
          {priceOnRequest ? (
            <p className="font-mono text-sm text-electric-light">Sob consulta</p>
          ) : (
            <>
              {hasOffer && <p className="font-mono text-xs text-muted line-through">{formatPrice(product.compareAtCents)}</p>}
              <p className="font-mono text-lg font-semibold tracking-tight text-[#D7EBDD]">{formatPrice(product.priceCents)}</p>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}