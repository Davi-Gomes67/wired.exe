import { Minus, Plus } from 'lucide-react';

export default function QuantityStepper({ value, max = 99, onChange, compact = false }) {
  const clamp = (next) => Math.min(Math.max(1, next), Math.max(1, max));

  return (
    <div className={`inline-flex items-center rounded-xl border border-line bg-carbon ${compact ? 'h-9' : 'h-11'}`}>
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= 1}
        aria-label="Diminuir quantidade"
        className="flex h-full w-9 items-center justify-center rounded-l-xl text-muted transition hover:text-[#D7EBDD] disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Minus size={15} />
      </button>
      <span className="w-8 text-center font-mono text-sm text-[#D7EBDD]" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Aumentar quantidade"
        className="flex h-full w-9 items-center justify-center rounded-r-xl text-muted transition hover:text-[#D7EBDD] disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
