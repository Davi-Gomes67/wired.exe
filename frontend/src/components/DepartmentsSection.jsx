import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { DEPARTMENTS } from '../utils/departments';

export default function DepartmentsSection({ categories = [] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {DEPARTMENTS.map(({ name, slug, icon: Icon, description }, index) => {
        const match = categories.find((c) => c.slug === slug);
        return (
          <Link
            key={slug}
            to={`/categoria/${slug}`}
            className="group surface surface-hover relative overflow-hidden p-5"
          >
            <div className="absolute inset-0 bg-grid opacity-20 [background-size:22px_22px]" />
            <div className="absolute inset-0 bg-gradient-to-br from-electric/10 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-electric/25 bg-electric/10 text-electric-light">
                <Icon size={20} />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">DEP_{String(index + 1).padStart(2, '0')}</span>
            </div>
            <div className="relative mt-8">
              <h3 className="font-display text-lg font-semibold tracking-tight text-base">{name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="font-mono uppercase tracking-[0.18em] text-muted">{match ?`${match.productCount} ${match.productCount === 1 ? 'item' : 'itens'}` : 'Categoria'}</span>
                <span className="inline-flex items-center gap-1 text-electric-light transition group-hover:translate-x-0.5">Acessar <ArrowUpRight size={14} /></span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

