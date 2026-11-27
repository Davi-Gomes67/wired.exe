import { Link } from 'react-router-dom';

export default function CategoryFilter({ categories = [], activeSlug = '' }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
      <div className="flex w-max gap-2">
        <Link
          to="/catalogo"
          className={`chip ${!activeSlug ?'chip-active' : ''}`}
          aria-current={!activeSlug ?'page' : undefined}
        >
          Todos
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            to={`/categoria/${category.slug}`}
            className={`chip ${activeSlug === category.slug ?'chip-active' : ''}`}
            aria-current={activeSlug === category.slug ?'page' : undefined}
          >
            {category.name}
            <span className="ml-2 font-mono text-[11px] text-muted">{category.productCount}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
