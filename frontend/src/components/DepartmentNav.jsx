import { Cpu, Gamepad2, Headphones, Keyboard, MemoryStick, Package, Shirt } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const DEPARTMENTS = [
  { name: 'HARDWARE LAB', slug: 'hardware-lab', icon: Cpu },
  { name: 'GEEK WEAR', slug: 'geek-wear', icon: Shirt },
  { name: 'PERIPHERALS', slug: 'peripherals', icon: Keyboard },
  { name: 'DIGITAL CULTURE', slug: 'digital-culture', icon: Headphones },
  { name: 'COMPONENTS', slug: 'components', icon: MemoryStick },
  { name: 'RETRO COMPUTING', slug: 'retro-computing', icon: Gamepad2 },
  { name: 'STARTER PACKS', slug: 'starter-packs', icon: Package },
];

export default function DepartmentNav() {
  return (
    <nav className="border-b border-line bg-carbon/70 backdrop-blur" aria-label="Departamentos">
      <div className="container-page">
        <div className="-mx-4 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
          <div className="flex min-w-max gap-1.5 lg:gap-1">
            {DEPARTMENTS.map(({ name, slug, icon: Icon }) => (
              <NavLink
                key={slug}
                to={`/categoria/${slug}`}
                className={({ isActive }) =>
                  `inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold tracking-[0.08em] transition ${
                    isActive
                      ? 'bg-electric/15 text-[#D7EBDD] ring-1 ring-electric/40'
                      : 'text-muted hover:bg-white/5 hover:text-slate-200'
                  }`
                }
              >
                <Icon size={14} className="shrink-0 text-electric-light/80" />
                <span className="whitespace-nowrap">{name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
