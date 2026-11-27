import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const CATEGORY_VISUALS = {
  'hardware-lab': 'from-electric/20 to-transparent',
  'geek-wear': 'from-electric/15 to-transparent',
  peripherals: 'from-cyber/10 to-transparent',
  'digital-culture': 'from-electric/15 to-transparent',
  components: 'from-electric/20 to-transparent',
  'retro-computing': 'from-electric/10 to-transparent',
  'starter-packs': 'from-cyber/10 to-transparent',
};

export default function CategoryShowcase({ categories = [] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {categories.map((category) => (
        <Link
          key={category.slug}
          to={`/categoria/${category.slug}`}
          className="group surface surface-hover relative flex min-h-[132px] flex-col justify-between overflow-hidden p-4"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_VISUALS[category.slug] || 'from-electric/10 to-transparent'} opacity-70 transition group-hover:opacity-100`} />
          <div className="absolute inset-0 bg-grid opacity-20 [background-size:20px_20px]" />
          <div className="relative flex items-start justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Dept.</span>
            <ArrowUpRight size={15} className="text-muted transition group-hover:text-electric-light" />
          </div>
          <div className="relative mt-4">
            <p className="text-sm font-semibold leading-snug text-base">{category.name}</p>
            <p className="mt-1 font-mono text-[11px] text-muted">{category.productCount} {category.productCount === 1 ? 'item' : 'itens'}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

