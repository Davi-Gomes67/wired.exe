import { useEffect, useState } from 'react';
import { Award, Lock } from 'lucide-react';
import { accountService, getErrorMessage } from '../../services/api';
import { formatDate } from '../../utils/format';

export default function AccountAchievementsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { let active = true; accountService.achievements().then((r) => { if (active) setItems(r.data || []); }).catch((e) => { if (active) setError(getErrorMessage(e)); }); return () => { active = false; }; }, []);
  if (error) return <div className="surface p-6 text-sm text-red-300">{error}</div>;
  return (
    <div>
      <p className="eyebrow">// achievements</p><h1 className="section-title mt-3">Achievements</h1><p className="section-desc">Conquistas desbloqueadas por eventos reais da conta.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((a) => (
          <article key={a.code} className={`surface p-5 ${a.unlocked ?'border-electric/25' : 'opacity-75'}`}>
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{a.code}</p><h2 className="mt-1 font-semibold text-base">{a.title}</h2><p className="mt-2 text-sm text-muted">{a.description}</p></div>
              <div className={`rounded-lg p-2 ${a.unlocked ?'bg-electric/10 text-electric-light' : 'bg-black/5 dark:bg-white/5 text-muted'}`}>{a.unlocked ?<Award size={18} /> : <Lock size={18} />}</div>
            </div>
            <p className="mt-4 text-xs text-muted">{a.unlocked ?`Desbloqueado em ${formatDate(a.unlockedAt)}` : 'Bloqueado'}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

