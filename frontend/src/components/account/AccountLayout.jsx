import { NavLink, Outlet } from 'react-router-dom';
import { Award, Bookmark, Clock3, Heart, LayoutDashboard, Package, Settings, Shield } from 'lucide-react';

const items = [
  { to: '/conta', end: true, label: 'Visão geral', icon: LayoutDashboard },
  { to: '/conta/pedidos', label: 'Pedidos', icon: Package },
  { to: '/conta/favoritos', label: 'Favoritos', icon: Heart },
  { to: '/conta/recentes', label: 'Vistos recentemente', icon: Clock3 },
  { to: '/conta/assinatura', label: 'Assinatura', icon: Shield },
  { to: '/conta/conquistas', label: 'Conquistas', icon: Award },
  { to: '/conta/comunidade-salvos', label: 'Posts salvos', icon: Bookmark },
  { to: '/conta/configuracoes', label: 'Configurações', icon: Settings },
];

export default function AccountLayout() {
  return (
    <div className="container-page py-8 sm:py-12">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="surface h-fit p-3">
          <p className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">WIRED ID</p>
          <nav className="grid gap-1" aria-label="Conta">
            {items.map(({ to, end, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${isActive ?'bg-electric/10 text-electric-light ring-1 ring-electric/25' : 'text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base'}`}>
                <Icon size={16} /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </div>
  );
}

