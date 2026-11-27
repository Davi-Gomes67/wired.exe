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
          className="input-field pl-10 pr-16"
        />
        <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-panel/70 px-2 py-0.5 font-mono text-[10px] text-muted sm:inline">ENTER</span>
      </div>
    </form>
  );
}
