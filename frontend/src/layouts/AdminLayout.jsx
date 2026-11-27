import { useState } from 'react';
import { BarChart3, BookOpen, Boxes, Image, LayoutDashboard, LogOut, Menu, MessageSquare, Package, Settings, ShoppingBag, Star, Tags, Users, X } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/produtos', label: 'Produtos', icon: Package },
  { to: '/admin/categorias', label: 'Categorias', icon: Tags },
  { to: '/admin/destaques', label: 'Destaques', icon: Star },
  { to: '/admin/midia', label: 'Mídia', icon: Image },
  { to: '/admin/estoque', label: 'Estoque', icon: Boxes },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/journal', label: 'Journal', icon: BookOpen },
  { to: '/admin/comunidade', label: 'Comunidade', icon: MessageSquare },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const close = () => setOpen(false);

  const NavItems = () => (
    <>
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={close} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ?'bg-electric/15 text-base ring-1 ring-electric/30' : 'text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base'}`}>
          <Icon size={17} /> {label}
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-void text-sub">
      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-line bg-carbon/40 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:p-4">
          <Link to="/admin" className="mb-6 flex items-center gap-2 px-2 font-mono text-lg font-bold text-base"><BarChart3 className="text-electric dark:text-electric-light" size={20} />WIRED<span className="text-electric dark:text-electric-light">.admin</span></Link>
          <nav className="space-y-1">{NavItems()}</nav>
          <div className="mt-auto border-t border-line pt-4">
            <p className="px-2 text-xs text-muted truncate">{user?.email}</p>
            <button type="button" onClick={() => { logout(); navigate('/'); }} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base"><LogOut size={17} /> Sair</button>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-void/90 px-4 py-3 backdrop-blur lg:px-6">
            <div className="flex items-center gap-3">
              <button type="button" className="btn-subtle h-10 w-10 px-0 lg:hidden" onClick={() => setOpen(true)} aria-label="Menu"><Menu size={20} /></button>
              <span className="font-mono text-sm font-semibold text-base lg:hidden">WIRED.admin</span>
            </div>
            <Link to="/" className="text-xs text-muted hover:text-base">Ver loja</Link>
          </header>
          <main className="p-4 sm:p-6"><Outlet /></main>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={close} />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col border-r border-line bg-carbon p-4">
            <div className="mb-6 flex items-center justify-between"><span className="font-mono font-bold text-base">WIRED.admin</span><button type="button" onClick={close} className="btn-subtle h-9 w-9 px-0"><X size={18} /></button></div>
            <nav className="space-y-1">{NavItems()}</nav>
            <button type="button" onClick={() => { logout(); navigate('/'); }} className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base"><LogOut size={17} /> Sair</button>
          </aside>
        </div>
      )}
    </div>
  );
}

export default AdminLayout;




