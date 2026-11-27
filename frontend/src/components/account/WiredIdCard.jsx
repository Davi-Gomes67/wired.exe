import { useEffect } from 'react';
import { X } from 'lucide-react';
import UserAvatar from '../UserAvatar';

export default function WiredIdCard({ user, rootAccess, compact = false, onExpand }) {
  const status = user?.active ?'ACTIVE' : 'INACTIVE';
  const access = rootAccess?.status === 'ACTIVE' ?'ROOT ACCESS' : 'STANDARD';
  return (
    <div className={`surface relative overflow-hidden border-electric/25 bg-gradient-to-br from-carbon via-void to-carbon ${compact ?'p-4' : 'p-5 sm:p-6'}`}>
      <div className="absolute inset-0 bg-grid opacity-20 [background-size:24px_24px]" />
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-electric/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <UserAvatar src={user?.avatarUrl} name={user?.displayName || user?.name} size={compact ?48 : 64} className="border-electric/30" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-electric-light">WIRED.exe</p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-base">DIGITAL ID</h3>
            </div>
          </div>
          <div className="rounded-md border border-electric/30 bg-electric/10 px-2 py-1 font-mono text-[10px] text-electric-light">{access}</div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Username</p><p className="mt-1 text-sm font-semibold text-base">{user?.displayName || user?.name || 'USER'}</p><p className="text-xs text-muted">@{user?.username || 'wired-user'}</p></div>
          <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Member ID</p><p className="mt-1 font-mono text-sm text-electric-light">{user?.publicMemberId || 'WRD-PENDING'}</p></div>
          <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Access Level</p><p className="mt-1 text-sm text-base">{access}</p></div>
          <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Account Status</p><p className="mt-1 text-sm text-base">{status}</p></div>
        </div>
        {!compact && onExpand && <button type="button" onClick={onExpand} className="btn-subtle mt-5 min-h-10 px-3 text-xs">Ampliar cartão</button>}
      </div>
    </div>
  );
}

export function WiredIdCardModal({ open, onClose, user, rootAccess }) {
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
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="WIRED ID">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl">
        <button type="button" onClick={onClose} className="btn-icon absolute -top-12 right-0" aria-label="Fechar"><X size={18} /></button>
        <WiredIdCard user={user} rootAccess={rootAccess} />
      </div>
    </div>
  );
}

