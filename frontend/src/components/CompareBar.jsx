import { Link } from 'react-router-dom';
import { GitCompareArrows, X } from 'lucide-react';
import { useCompare } from '../context/CompareContext';

export default function CompareBar() {
  const { count, max, clear, notice } = useCompare();
  if (count === 0 && !notice) return null;
  return (
    <div className="fixed inset-x-0 bottom-16 z-[60] px-4 md:bottom-4">
      <div className="container-page">
        <div className="surface flex flex-wrap items-center justify-between gap-3 border-electric/25 bg-carbon/95 p-3 shadow-2xl backdrop-blur-xl">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-electric-light"><GitCompareArrows size={14} className="mr-2 inline" />{count}/{max} selecionados para comparação</p>
          <div className="flex items-center gap-2">
            {notice && <span className="text-xs text-amber-300">{notice}</span>}
            {count > 0 && <button type="button" onClick={clear} className="btn-subtle min-h-10 px-3 text-xs"><X size={14} />Limpar</button>}
            <Link to="/comparar" className={`btn-primary min-h-10 px-4 text-xs ${count < 2 ?'pointer-events-none opacity-50' : ''}`}>Comparar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
