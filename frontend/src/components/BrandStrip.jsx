import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BrandStrip({ brands = [], activeBrand = '' }) {
  if (!brands.length) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {brands.map((brand) => {
        const active = activeBrand === brand;
        return (
          <Link
            key={brand}
            to={`/catalogo?brand=${encodeURIComponent(brand)}`}
            className={`group surface flex min-h-[88px] items-center justify-center px-4 py-5 text-center transition ${
              active ?'border-electric/50 shadow-glow' : 'hover:border-electric/40'
            }`}
          >
            <div>
              <p className="font-display text-sm font-semibold tracking-wide text-sub transition group-hover:text-base sm:text-base">
                {brand}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted opacity-0 transition group-hover:opacity-100">
                Ver <ArrowRight size={10} />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

