import { X } from 'lucide-react';

export default function ActiveFilters({ chips, onRemove, onClear }) {
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button key={chip.key} type="button" onClick={() => onRemove(chip)} className="inline-flex items-center gap-1.5 rounded-md border border-electric/25 bg-electric/10 px-2.5 py-1.5 text-[11px] font-medium text-electric-light transition hover:border-electric/45">
          <span>{chip.label}</span><X size={13} />
        </button>
      ))}
      <button type="button" onClick={onClear} className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted transition hover:border-electric/30 hover:text-base">CLEAR ALL</button>
    </div>
  );
}

