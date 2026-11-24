import { Search } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Buscar produtos...',
  label = 'Buscar produtos',
}) {
  return (
    <form onSubmit={onSubmit} role="search" className="w-full">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          size={17}
        />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="input-field pl-10"
        />
      </div>
    </form>
  );
}
