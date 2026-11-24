import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

export default function ProductGallery({ images = [], productName = 'Produto' }) {
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState({});

  const safeImages = images.length ? images : [];
  const current = safeImages[active] || safeImages[0];

  if (!safeImages.length) {
    return (
      <div className="surface flex aspect-square items-center justify-center text-muted">
        <div className="text-center">
          <ImageOff size={36} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Imagem indisponível</p>
        </div>
      </div>
    );
  }

  const move = (dir) => setActive((prev) => (prev + dir + safeImages.length) % safeImages.length);

  return (
    <div className="space-y-3">
      <div className="surface relative aspect-square overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-35 [background-size:28px_28px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(139,92,246,0.12),transparent_60%)]" />
        {!failed[current.url] ? (
          <img
            src={current.url}
            alt={current.alt || productName}
            className="relative h-full w-full object-contain p-6 sm:p-10"
            onError={() => setFailed((f) => ({ ...f, [current.url]: true }))}
          />
        ) : (
          <div className="relative flex h-full items-center justify-center text-muted">
            <ImageOff size={42} />
          </div>
        )}

        {safeImages.length > 1 && (
          <>
            <button type="button" onClick={() => move(-1)} aria-label="Imagem anterior" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-xl border border-line bg-carbon/80 p-2 text-slate-200 backdrop-blur hover:border-electric/50 hover:text-[#D7EBDD]">
              <ChevronLeft size={18} />
            </button>
            <button type="button" onClick={() => move(1)} aria-label="Próxima imagem" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-line bg-carbon/80 p-2 text-slate-200 backdrop-blur hover:border-electric/50 hover:text-[#D7EBDD]">
              <ChevronRight size={18} />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-carbon/80 px-2.5 py-1 font-mono text-[11px] text-muted backdrop-blur">
              {active + 1}/{safeImages.length}
            </span>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {safeImages.map((img, index) => (
            <button
              key={`${img.url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver imagem ${index + 1}`}
              className={`surface relative aspect-square overflow-hidden p-1.5 transition ${
                index === active ? 'border-electric/60 ring-1 ring-electric/40' : 'hover:border-electric/30'
              }`}
            >
              {!failed[img.url] ? (
                <img src={img.url} alt="" className="h-full w-full object-contain" loading="lazy" onError={() => setFailed((f) => ({ ...f, [img.url]: true }))} />
              ) : (
                <div className="flex h-full items-center justify-center text-muted"><ImageOff size={16} /></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
