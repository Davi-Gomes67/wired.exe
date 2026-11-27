import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function FilterDrawer({ open, onClose, title = 'Filtros', children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-sm border-l border-line bg-carbon/95 p-5 shadow-2xl backdrop-blur-xl overflow-y-auto">
        <div className="mb-5 flex items-center justify-between"><h2 className="font-mono text-sm uppercase tracking-[0.2em] text-electric-light">{title}</h2><button type="button" onClick={onClose} className="btn-icon" aria-label="Fechar filtros"><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}
