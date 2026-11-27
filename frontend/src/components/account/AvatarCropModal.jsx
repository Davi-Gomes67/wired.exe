import { useEffect, useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

export default function AvatarCropModal({ file, onClose, onConfirm }) {
  const [src, setSrc] = useState('');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setSrc(url);
    setZoom(1); setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const clampOffset = (next, z = zoom) => {
    const img = imgRef.current; if (!img) return next;
    const box = 280; const base = Math.max(box / img.naturalWidth, box / img.naturalHeight);
    const drawW = img.naturalWidth * base * z; const drawH = img.naturalHeight * base * z;
    const maxX = Math.max(0, (drawW - box) / 2); const maxY = Math.max(0, (drawH - box) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, next.x)), y: Math.min(maxY, Math.max(-maxY, next.y)) };
  };

  const onPointerDown = (e) => { setDrag({ x: e.clientX - offset.x, y: e.clientY - offset.y }); e.currentTarget.setPointerCapture?.(e.pointerId); };
  const onPointerMove = (e) => { if (!drag) return; setOffset(clampOffset({ x: e.clientX - drag.x, y: e.clientY - drag.y })); };
  const onPointerUp = () => setDrag(null);

  const exportImage = async () => {
    const img = imgRef.current; if (!img) return;
    const box = 280; const base = Math.max(box / img.naturalWidth, box / img.naturalHeight);
    const drawW = img.naturalWidth * base * zoom; const drawH = img.naturalHeight * base * zoom;
    const left = (box - drawW) / 2 + offset.x; const top = (box - drawH) / 2 + offset.y;
    const sx = Math.max(0, (0 - left) / (base * zoom));
    const sy = Math.max(0, (0 - top) / (base * zoom));
    const sSize = Math.min(img.naturalWidth - sx, img.naturalHeight - sy, box / (base * zoom));
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = '#0B120D'; ctx.fillRect(0, 0, 512, 512);
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, 512, 512);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (blob) onConfirm(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }));
  };

  if (!file) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Recortar avatar">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="surface relative w-full max-w-md p-5">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-mono text-sm uppercase tracking-[0.2em] text-electric-light">Recortar avatar</h2><button type="button" className="btn-icon" onClick={onClose} aria-label="Fechar"><X size={18} /></button></div>
        <div className="mx-auto relative h-[280px] w-[280px] overflow-hidden rounded-full border border-electric/30 bg-carbon touch-none" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
          {src && <img ref={imgRef} src={src} alt="Prévia do avatar" className="absolute left-1/2 top-1/2 max-w-none select-none" style={{ transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`, transformOrigin: 'center' }} draggable={false} />}
        </div>
        <div className="mt-4 flex items-center gap-3"><ZoomOut size={16} className="text-muted" /><input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => { const z = Number(e.target.value); setZoom(z); setOffset((o) => clampOffset(o, z)); }} className="w-full accent-[#39FF70]" aria-label="Zoom" /><ZoomIn size={16} className="text-muted" /></div>
        <div className="mt-5 flex justify-end gap-2"><button type="button" className="btn-subtle min-h-10 px-4 text-xs" onClick={onClose}>Cancelar</button><button type="button" className="btn-primary min-h-10 px-4 text-xs" onClick={exportImage}>Salvar avatar</button></div>
      </div>
    </div>
  );
}
