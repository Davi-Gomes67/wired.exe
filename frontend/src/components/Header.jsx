import { useEffect, useState } from 'react';
import { ChevronDown, GitCompareArrows, Heart, Menu, Moon, Search, ShoppingCart, Sun, Terminal, User, X } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import { useWishlist } from '../context/WishlistContext';
import SearchBar from './SearchBar';
import UserAvatar from './UserAvatar';
import { DEPARTMENTS } from '../utils/departments';
import { useTheme } from '../context/ThemeContext';

function Header() {
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { count: compareCount } = useCompare();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [mobileOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    navigate(term ?`/catalogo?q=${encodeURIComponent(term)}` : '/catalogo');
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const navLink = ({ isActive }) => `inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium transition ${isActive ?'text-base bg-black/5 dark:bg-black/5 dark:bg-white/5' : 'text-muted hover:text-base hover:bg-black/5 dark:hover:bg-white/5'}`;

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-void/90 backdrop-blur-xl">
      <div className="container-page">
        <div className="flex h-16 items-center gap-2 sm:gap-3 md:h-[4.5rem]">
          <button
            type="button"
            className="btn-subtle -ml-2 h-10 w-10 px-0 lg:hidden"
            aria-label={mobileOpen ?'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            onClick={() => { setMobileOpen((v) => !v); setSearchOpen(false); }}
          >
            {mobileOpen ?<X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="WIRED.exe início">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-electric/35 bg-electric/10 text-electric dark:text-electric-light transition group-hover:shadow-glow">
              <Terminal size={17} strokeWidth={2.2} />
            </span>
            <span className="font-mono text-base font-bold tracking-tight text-base sm:text-lg">
              WIRED<span className="text-electric dark:text-electric-light">.exe</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navegação principal">
            <NavLink to="/catalogo" className={navLink}>Produtos</NavLink>
            <div className="group relative">
              <NavLink to="/catalogo" className={({ isActive }) => `inline-flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-medium transition ${isActive ?'text-base bg-black/5 dark:bg-white/5' : 'text-muted hover:text-base hover:bg-black/5 dark:bg-white/5'}`}>
                Categories <ChevronDown size={14} className="text-muted transition group-hover:rotate-180 group-focus-within:rotate-180" />
              </NavLink>
              <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="surface w-[320px] p-2 shadow-soft">
                  <p className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">Departamentos</p>
                  {DEPARTMENTS.map(({ name, slug }) => (
                    <Link key={slug} to={`/categoria/${slug}`} className="flex rounded-lg px-3 py-2.5 text-sm text-sub transition hover:bg-black/5 dark:bg-white/5 hover:text-base">
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <NavLink to="/journal" className={navLink}>Journal</NavLink>
            <NavLink to="/community" className={navLink}>Community</NavLink>
            <NavLink to="/root-access" className={({ isActive }) => `inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold tracking-wide transition ${isActive ?'bg-electric/10 text-electric dark:text-electric-light ring-1 ring-electric/30' : 'text-electric dark:text-electric-light/90 hover:bg-electric/10 hover:text-electric dark:text-electric-light'}`}>
              ROOT ACCESS
            </NavLink>
          </nav>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <div className="hidden w-full max-w-[280px] xl:block">
                <SearchBar value={query} onChange={setQuery} onSubmit={submitSearch} placeholder="Buscar no sistema..." />
              </div>
              <button type="button" className="btn-subtle h-10 w-10 px-0 xl:hidden" aria-label="Buscar" aria-expanded={searchOpen} onClick={() => { setSearchOpen((v) => !v); setMobileOpen(false); }}>
                <Search size={19} />
              </button>
              <button type="button" className="btn-subtle h-10 w-10 px-0" aria-label={theme === 'dark' ?'Ativar modo claro' : 'Ativar modo escuro'} aria-pressed={theme === 'light'} onClick={toggleTheme} title={theme === 'dark' ?'Modo claro' : 'Modo escuro'}>
                {theme === 'dark' ?<Sun size={18} /> : <Moon size={18} />}
              </button>

              <Link to="/favoritos" className="relative hidden h-10 w-10 items-center justify-center rounded-lg text-muted transition hover:bg-black/5 dark:bg-white/5 hover:text-base md:inline-flex" aria-label={`Favoritos: ${wishlistCount}`}>
                <Heart size={18} />
                {wishlistCount > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-electric" />}
              </Link>
              <Link to="/comparar" className="relative hidden h-10 w-10 items-center justify-center rounded-lg text-muted transition hover:bg-black/5 dark:bg-white/5 hover:text-base md:inline-flex" aria-label={`Comparação: ${compareCount}`}>
                <GitCompareArrows size={18} />
                {compareCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-electric px-1 text-[9px] font-bold text-void">{compareCount}</span>}
              </Link>

              {isAuthenticated ?(
                <>
                  {user?.role === 'ADMIN' && <NavLink to="/admin" className="hidden h-10 items-center rounded-lg px-3 text-sm text-muted transition hover:bg-black/5 dark:bg-white/5 hover:text-base md:inline-flex">Admin</NavLink>}
                  <NavLink to="/conta" className="hidden h-10 items-center gap-2 rounded-lg px-2 text-sm text-muted transition hover:bg-black/5 dark:bg-white/5 hover:text-base md:inline-flex" aria-label="Conta"><UserAvatar src={user?.avatarUrl} name={user?.displayName || user?.name} size={32} /><span className="hidden 2xl:inline">Conta</span></NavLink>
                  <button type="button" onClick={() => { logout(); navigate('/'); }} className="hidden h-10 items-center rounded-lg px-3 text-sm text-muted transition hover:bg-black/5 dark:bg-white/5 hover:text-base md:inline-flex">Sair</button>
                </>
              ) : (
                <NavLink to="/login" className="hidden h-10 items-center gap-2 rounded-lg px-3 text-sm text-muted transition hover:bg-black/5 dark:bg-white/5 hover:text-base md:inline-flex"><User size={17} /><span className="hidden 2xl:inline">Entrar</span></NavLink>
              )}

              <Link to="/carrinho" className="relative flex h-10 items-center justify-center gap-2 rounded-xl border border-line bg-panel/60 px-3 text-base transition hover:border-electric/45 hover:text-electric dark:text-electric-light" aria-label={`Carrinho com ${totalItems} itens`}>
                <ShoppingCart size={18} strokeWidth={1.8} />
                <span className="hidden text-sm sm:inline">Carrinho</span>
                {totalItems > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-electric px-1 text-[10px] font-bold text-void sm:static sm:ml-0">{totalItems}</span>}
              </Link>
            </div>
        </div>

        {searchOpen && (
          <div className="border-t border-line py-3 xl:hidden">
            <SearchBar value={query} onChange={setQuery} onSubmit={submitSearch} placeholder="Buscar produtos, marcas, categorias..." />
          </div>
        )}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-black/55 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="border-t border-line bg-carbon/98 backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
            <div className="container-page max-h-[calc(100dvh-4rem)] overflow-y-auto py-5">
              <nav className="grid gap-1" aria-label="Menu mobile">
                <NavLink to="/catalogo" className={({ isActive }) => `rounded-xl px-3 py-3 text-sm font-medium ${isActive ?'bg-black/5 dark:bg-white/5 text-base' : 'text-sub hover:bg-black/5 dark:bg-white/5'}`}>Produtos</NavLink>
                <NavLink to="/journal" className={({ isActive }) => `rounded-xl px-3 py-3 text-sm font-medium ${isActive ?'bg-black/5 dark:bg-white/5 text-base' : 'text-sub hover:bg-black/5 dark:bg-white/5'}`}>Journal</NavLink>
                <NavLink to="/community" className={({ isActive }) => `rounded-xl px-3 py-3 text-sm font-medium ${isActive ?'bg-black/5 dark:bg-white/5 text-base' : 'text-sub hover:bg-black/5 dark:bg-white/5'}`}>Community</NavLink>
                <NavLink to="/root-access" className={({ isActive }) => `rounded-xl px-3 py-3 text-sm font-semibold ${isActive ?'bg-electric/10 text-electric dark:text-electric-light' : 'text-electric dark:text-electric-light hover:bg-electric/10'}`}>ROOT ACCESS</NavLink>
              </nav>
              <div className="mt-5">
                <p className="eyebrow mb-3">Categories</p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {DEPARTMENTS.map(({ name, slug }) => (
                    <NavLink key={slug} to={`/categoria/${slug}`} className={({ isActive }) => `rounded-lg px-3 py-2.5 text-sm transition ${isActive ?'bg-black/5 dark:bg-white/5 text-base' : 'text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base'}`}>{name}</NavLink>
                  ))}
                </div>
              </div>
              <div className="mt-5 grid gap-1 border-t border-line pt-4">
                <NavLink to="/favoritos" className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base">Favoritos {wishlistCount > 0 ?`(${wishlistCount})` : ''}</NavLink>
                <NavLink to="/comparar" className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base">Comparar {compareCount > 0 ?`(${compareCount})` : ''}</NavLink>
                {isAuthenticated ?(
                  <>
                    {user?.role === 'ADMIN' && <NavLink to="/admin" className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base">Admin</NavLink>}
                    <NavLink to="/conta" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base"><UserAvatar src={user?.avatarUrl} name={user?.displayName || user?.name} size={32} /><span>Conta</span></NavLink>
                    <NavLink to="/pedidos" className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base">Pedidos</NavLink>
                    <button type="button" onClick={() => { logout(); setMobileOpen(false); navigate('/'); }} className="rounded-lg px-3 py-2.5 text-left text-sm text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base">Sair</button>
                  </>
                ) : (
                  <NavLink to="/login" className="rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-black/5 dark:bg-white/5 hover:text-base">Entrar</NavLink>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;




