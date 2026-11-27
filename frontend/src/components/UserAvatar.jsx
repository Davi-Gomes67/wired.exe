import { useState } from 'react';
import { User } from 'lucide-react';
import { resolveAssetUrl } from '../utils/asset-url';

const SIZES = {
  32: 'h-8 w-8 text-[10px]',
  40: 'h-10 w-10 text-xs',
  48: 'h-12 w-12 text-sm',
  64: 'h-16 w-16 text-base',
  96: 'h-24 w-24 text-xl',
  128: 'h-32 w-32 text-2xl',
};

export default function UserAvatar({ src, name = '', size = 40, className = '' }) {
  const [failed, setFailed] = useState(false);
  const resolved = resolveAssetUrl(src);
  const showImage = resolved && !failed;
  const initial = (name || 'U').trim().charAt(0).toUpperCase();
  const sizeClass = SIZES[size] || SIZES[40];
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full border border-line bg-carbon/80 aspect-square ${sizeClass} ${className}`} aria-label={name ?`Avatar de ${name}` : 'Avatar'}>
      {showImage ?(
        <img src={resolved} alt={name ?`Avatar de ${name}` : 'Avatar'} className="h-full w-full object-cover object-center" onError={() => setFailed(true)} loading="lazy" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-panel to-carbon text-electric-light/80">
          {name ?<span className="font-mono font-semibold">{initial}</span> : <User size={Math.max(14, Math.round(size * 0.45))} />}
        </div>
      )}
    </div>
  );
}
