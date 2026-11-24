import { Home, LayoutGrid, ShoppingCart } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const links = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/catalogo', label: 'Catálogo', icon: LayoutGrid },
  { to: '/carrinho', label: 'Carrinho', icon: ShoppingCart },
];

function MobileNav() {
  const { totalItems } = useCart();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-carbon/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${
                isActive ? 'text-electric-light' : 'text-muted'
              }`
            }
          >
            <Icon size={21} strokeWidth={1.8} />
            <span>{label}</span>
            {to === '/carrinho' && totalItems > 0 && (
              <span className="absolute right-[28%] top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-electric px-1 text-[10px] font-bold text-[#D7EBDD]">
                {totalItems}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileNav;
