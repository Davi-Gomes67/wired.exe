import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Search, ShoppingCart, Terminal, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchBar from './SearchBar';
import { DEPARTMENTS } from '../utils/departments';

function Header() {
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  const submitSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/catalogo?q=${encodeURIComponent(term)}` : '/catalogo');
    setMobileSearch(false);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-void/85 backdrop-blur-xl">
      <div className="container-page">
        <div className="flex h-16 items-center gap-3 md:h-[4.5rem] md:gap-5">
          <button
            type="button"
            className="btn-subtle -ml-2 h-10 w-10 px-0 md:hidden"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => { setMobileOpen((v) => !v); setMobileSearch(false); }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="WIRED.exe início">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-electric/15 text-electric-light ring-1 ring-electric/35 transition group-hover:shadow-glow">
              <Terminal size={18} strokeWidth={2.2} />
            </span>
            <span className="font-mono text-base font-bold tracking-tight text-[#D7EBDD] sm:text-lg">
              WIRED<span className="text-electric-light">.exe</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
            <NavLink to="/catalogo" className={({ isActive }) => `inline-flex h-10 items-center rounded-xl px-3 text-sm font-semibold tracking-wide transition ${isActive ? 'bg-electric/15 text-[#D7EBDD] ring-1 ring-electric/30' : 'text-[#D7EBDD]/90 hover:bg-white/5 hover:text-[#D7EBDD]'}`}>Products</NavLink>
          </nav>

          <div className="hidden max-w-xl flex-1 md:block lg:max-w-2xl">
            <SearchBar value={query} onChange={setQuery} onSubmit={submitSearch} placeholder="Buscar hardware, periféricos, cultura geek..." />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              className="btn-subtle h-10 w-10 px-0 md:hidden"
              aria-label="Buscar"
              onClick={() => { setMobileSearch((v) => !v); setMobileOpen(false); }}
            >
              <Search size={20} />
            </button>

            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && <NavLink to="/admin" className={({ isActive }) => `hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition sm:inline-flex ${isActive ? 'bg-white/5 text-[#D7EBDD]' : 'text-muted hover:bg-white/5 hover:text-[#D7EBDD]'}`}>Admin</NavLink>}
                <NavLink to="/pedidos" className={({ isActive }) => `hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition sm:inline-flex ${isActive ? 'bg-white/5 text-[#D7EBDD]' : 'text-muted hover:bg-white/5 hover:text-[#D7EBDD]'}`}>Pedidos</NavLink>
                <NavLink to="/conta" className={({ isActive }) => `hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition sm:inline-flex ${isActive ? 'bg-white/5 text-[#D7EBDD]' : 'text-muted hover:bg-white/5 hover:text-[#D7EBDD]'}`}>
                  <User size={18} /><span className="hidden lg:inline">{user?.name?.split(' ')[0] || 'Conta'}</span>
                </NavLink>
                <button type="button" onClick={() => { logout(); navigate('/'); }} className="hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted transition hover:bg-white/5 hover:text-[#D7EBDD] sm:inline-flex" aria-label="Sair">
                  <LogOut size={16} /><span className="hidden lg:inline">Sair</span>
                </button>
              </>
            ) : (
              <NavLink to="/login" className={({ isActive }) => `hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition sm:inline-flex ${isActive ? 'bg-white/5 text-[#D7EBDD]' : 'text-muted hover:bg-white/5 hover:text-[#D7EBDD]'}`}>
                <User size={18} /><span className="hidden lg:inline">Entrar</span>
              </NavLink>
            )}

            <Link
              to="/carrinho"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-panel/60 text-[#D7EBDD] transition hover:border-electric/50 hover:text-[#D7EBDD] sm:w-auto sm:px-3"
              aria-label={`Carrinho com ${totalItems} itens`}
            >
              <ShoppingCart size={18} strokeWidth={1.8} />
              <span className="hidden text-sm font-medium sm:ml-2 sm:inline">Carrinho</span>
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-electric px-1 text-[10px] font-bold text-[#D7EBDD] sm:static sm:ml-2">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {mobileSearch && (
          <div className="border-t border-line py-3 md:hidden">
            <SearchBar value={query} onChange={setQuery} onSubmit={submitSearch} placeholder="Buscar produtos..." />
          </div>
        )}
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-carbon/95 md:hidden">
          <div className="container-page py-4">
            <NavLink to="/catalogo" onClick={() => setMobileOpen(false)} className={({ isActive }) => `mb-3 flex rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-electric/15 text-[#D7EBDD]' : 'text-[#D7EBDD] hover:bg-white/5'}`}>Products</NavLink>
            <p className="eyebrow mb-3">Departamentos</p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {DEPARTMENTS.map(({ name, slug }) => (
                <NavLink
                  key={slug}
                  to={`/categoria/${slug}`}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive ? 'bg-electric/15 text-[#D7EBDD]' : 'text-[#D7EBDD]/90 hover:bg-white/5 hover:text-[#D7EBDD]'
                    }`
                  }
                >
                  {name}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <>
                  {user?.role === 'ADMIN' && <NavLink to="/admin" onClick={() => setMobileOpen(false)} className={({ isActive }) => `rounded-lg px-3 py-2.5 text-sm font-medium transition sm:col-span-2 ${isActive ? 'bg-electric/15 text-[#D7EBDD]' : 'text-muted hover:bg-white/5 hover:text-[#D7EBDD]'}`}>Admin</NavLink>}
                  <NavLink to="/pedidos" onClick={() => setMobileOpen(false)} className={({ isActive }) => `rounded-lg px-3 py-2.5 text-sm font-medium transition sm:col-span-2 ${isActive ? 'bg-electric/15 text-[#D7EBDD]' : 'text-muted hover:bg-white/5 hover:text-[#D7EBDD]'}`}>Pedidos</NavLink>
                  <NavLink to="/conta" onClick={() => setMobileOpen(false)} className={({ isActive }) => `rounded-lg px-3 py-2.5 text-sm font-medium transition sm:col-span-2 ${isActive ? 'bg-electric/15 text-[#D7EBDD]' : 'text-muted hover:bg-white/5 hover:text-[#D7EBDD]'}`}>Conta</NavLink>
                  <button type="button" onClick={() => { logout(); setMobileOpen(false); navigate('/'); }} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted hover:bg-white/5 hover:text-[#D7EBDD] sm:col-span-2">Sair</button>
                </>
              ) : (
                <NavLink to="/login" onClick={() => setMobileOpen(false)} className={({ isActive }) => `rounded-lg px-3 py-2.5 text-sm font-medium transition sm:col-span-2 ${isActive ? 'bg-electric/15 text-[#D7EBDD]' : 'text-muted hover:bg-white/5 hover:text-[#D7EBDD]'}`}>Entrar</NavLink>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
