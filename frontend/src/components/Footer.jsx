import { Link } from 'react-router-dom';
import { Github, Instagram, Terminal, Youtube } from 'lucide-react';
import { DEPARTMENTS } from '../utils/departments';

function Footer() {
  return (
    <footer className="relative mt-20 border-t border-line bg-carbon/60">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/35 to-transparent" />
      <div className="container-page py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 font-mono text-lg font-bold tracking-tight text-base">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-electric/30 bg-electric/10 text-electric-light">
                <Terminal size={15} strokeWidth={2.2} />
              </span>
              WIRED<span className="text-electric-light">.exe</span>
            </Link>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.22em] text-electric-light/85">THE INTERNET IS PART OF REALITY.</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              Hardware, cultura digital e curadoria geek em uma experiência de loja com identidade própria.
            </p>
            <div className="mt-5 flex items-center gap-2 font-mono text-[11px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-electric animate-pulse-soft" aria-hidden="true" />
              SYSTEM ONLINE / NODE BR-01
            </div>
          </div>

          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Navegação</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/catalogo" className="text-sub transition hover:text-electric-light">Produtos</Link></li>
              <li><Link to="/journal" className="text-sub transition hover:text-electric-light">Journal</Link></li>
              <li><Link to="/root-access" className="text-sub transition hover:text-electric-light">ROOT ACCESS</Link></li>
              <li><Link to="/carrinho" className="text-sub transition hover:text-electric-light">Carrinho</Link></li>
              <li><Link to="/conta" className="text-sub transition hover:text-electric-light">Conta</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Departamentos</p>
            <ul className="space-y-2.5 text-sm">
              {DEPARTMENTS.map(({ name, slug }) => (
                <li key={slug}><Link to={`/categoria/${slug}`} className="text-sub transition hover:text-electric-light">{name}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Institucional</p>
            <ul className="space-y-2.5 text-sm text-sub">
              <li><span className="text-muted">Pagamento:</span> simulação demonstrativa</li>
              <li><span className="text-muted">Frete:</span> calculado conforme regras do pedido</li>
              <li><span className="text-muted">Suporte:</span> canais da conta e configurações da loja</li>
              <li><Link to="/pedidos" className="transition hover:text-electric-light">Pedidos e histórico</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <p className="font-mono">© {new Date().getFullYear()} WIRED.exe. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
            <span>SYS.STATUS: ONLINE · BUILD: PHASE_07</span>
            <Link to="/terminal" className="inline-flex items-center gap-1 text-muted/70 transition hover:text-electric-light" aria-label="Abrir terminal secreto" title="SECRET TERMINAL">
              <Terminal size={12} aria-hidden="true" />
              <span className="hidden sm:inline">terminal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;



