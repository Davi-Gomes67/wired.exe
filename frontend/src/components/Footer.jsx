import { Link } from 'react-router-dom';
import { Github, Instagram, Terminal, Twitter, Youtube } from 'lucide-react';
import { DEPARTMENTS } from '../utils/departments';

function Footer() {
  return (
    <footer className="border-t border-line bg-carbon/80">
      <div className="container-page py-12 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-electric/15 text-electric-light ring-1 ring-electric/35">
                <Terminal size={18} />
              </span>
              <span className="font-mono text-lg font-bold text-[#D7EBDD]">
                WIRED<span className="text-electric-light">.exe</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-electric-light">The internet is part of reality.</span>
              <span className="mt-2 block">Hardware for your projects. Culture for your identity.</span>
              <span className="mt-2 block text-xs text-muted/80">TECHNOLOGY • GEEK CULTURE • ELECTRONICS</span>
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Instagram, Twitter, Youtube, Github].map((Icon, i) => (
                <span
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-panel/50 text-muted"
                  aria-hidden="true"
                >
                  <Icon size={16} />
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#D7EBDD]">Departamentos</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {DEPARTMENTS.slice(0, 5).map((dept) => (
                <li key={dept.slug}>
                  <Link className="transition hover:text-[#D7EBDD]" to={`/categoria/${dept.slug}`}>{dept.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#D7EBDD]">Explorar</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {DEPARTMENTS.slice(4).map((dept) => (
                <li key={dept.slug}>
                  <Link className="transition hover:text-[#D7EBDD]" to={`/categoria/${dept.slug}`}>{dept.name}</Link>
                </li>
              ))}
              <li><Link className="transition hover:text-[#D7EBDD]" to="/catalogo">Products</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#D7EBDD]">Atendimento</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li><Link className="transition hover:text-[#D7EBDD]" to="/conta">Conta</Link></li>
              <li><Link className="transition hover:text-[#D7EBDD]" to="/carrinho">Carrinho</Link></li>
              <li><span className="text-muted/80">Pedidos: sem pagamento online</span></li>
              <li><span className="text-muted/80">Catálogo: dados de demonstração</span></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} WIRED.exe — catálogo tecnológico e cultura geek.</span>
          <span className="font-mono text-[11px] text-electric-light/80">The internet is part of reality.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
