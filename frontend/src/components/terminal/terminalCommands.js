import { catalogService, journalService, rootAccessService } from '../../services/api';
import { formatPrice } from '../../utils/format';

const safeText = (value, fallback = 'N/D') => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
};

const asArray = (v) => (Array.isArray(v) ? v : []);

export const BOOT_LINES = [
  'WIRED.exe BIOS v2.026',
  'Initializing secure connection...',
  'Loading system modules...',
  'Connection established.',
  'Welcome to WIRED.exe',
  "Type 'help' to list available commands.",
];

export const COMMAND_HELP = [
  { name: 'help', description: 'Lista os comandos disponíveis.' },
  { name: 'about', description: 'Apresenta a identidade do WIRED.exe.' },
  { name: 'products', description: 'Lista produtos reais do catálogo.' },
  { name: 'categories', description: 'Lista departamentos e categorias reais.' },
  { name: 'featured', description: 'Mostra o produto em destaque atual.' },
  { name: 'root', description: 'Apresenta o programa ROOT ACCESS.' },
  { name: 'journal', description: 'Acessa o WIRED Journal.' },
  { name: 'profile', description: 'Abre WIRED ID ou login.' },
  { name: 'date', description: 'Exibe a data atual.' },
  { name: 'whoami', description: 'Exibe o usuário atual.' },
  { name: 'clear', description: 'Limpa o histórico visual.' },
  { name: 'matrix', description: 'Ativa uma animação curta.' },
  { name: 'sudo', description: 'Solicita privilégios temáticos.' },
  { name: 'exit', description: 'Retorna à página inicial.' },
];

const normalize = (raw) => String(raw || '').trim().replace(/\s+/g, ' ').toLowerCase();

export async function runTerminalCommand(raw, ctx) {
  const input = normalize(raw);
  if (!input) return { lines: [] };

  if (input === 'help') {
    return {
      lines: [
        { type: 'text', text: 'Comandos disponíveis:' },
        ...COMMAND_HELP.map((c) => ({ type: 'text', text: `${c.name.padEnd(12)} - ${c.description}` })),
        { type: 'muted', text: 'Alguns módulos ocultos podem existir no sistema.' },
      ],
    };
  }

  if (input === 'about') {
    return {
      lines: [
        { type: 'text', text: 'WIRED.exe é uma loja e interface de cultura digital.' },
        { type: 'text', text: 'Hardware, retro computing, geek wear e artefatos da rede coexistem no mesmo sinal.' },
        { type: 'muted', text: 'THE INTERNET IS PART OF REALITY.' },
      ],
    };
  }

  if (input === 'products') {
    const res = await catalogService.getProducts({ pageSize: 8, sort: 'newest' });
    const products = asArray(res?.data);
    if (!products.length) return { lines: [{ type: 'muted', text: 'Nenhum produto disponível no catálogo no momento.' }] };
    return {
      lines: [
        { type: 'text', text: `Produtos no catálogo (${products.length} exibidos):` },
        ...products.map((p) => ({
          type: 'link',
          text: `${safeText(p.name)} · ${formatPrice(p.priceCents)} · ${p.stock > 0 ?`${p.stock} em estoque` : 'indisponível'} · ${safeText(p.category?.name, 'Sem categoria')}`,
          to: `/produto/${p.slug}`,
          label: 'abrir',
        })),
        { type: 'link', text: 'Ver catálogo completo', to: '/catalogo', label: 'abrir' },
      ],
    };
  }

  if (input === 'categories') {
    const res = await catalogService.getCategories();
    const categories = asArray(res?.data);
    if (!categories.length) return { lines: [{ type: 'muted', text: 'Nenhuma categoria disponível no momento.' }] };
    return {
      lines: [
        { type: 'text', text: 'Departamentos/categorias:' },
        ...categories.map((c) => ({
          type: 'link',
          text: `${safeText(c.name)} (${Number(c.productCount || 0)} produtos)`,
          to: `/categoria/${c.slug}`,
          label: 'acessar',
        })),
      ],
    };
  }

  if (input === 'featured') {
    const [featRes, lainRes] = await Promise.all([
      catalogService.getProducts({ featured: 'true', pageSize: 8 }).catch(() => ({ data: [] })),
      catalogService.getProductBySlug('action-figure-lain').catch(() => null),
    ]);
    const feat = asArray(featRes?.data);
    const lain = lainRes?.data || null;
    const merged = lain ?[lain, ...feat.filter((p) => p.slug !== lain.slug)] : feat;
    const product = merged[0];
    if (!product) return { lines: [{ type: 'muted', text: 'Nenhum produto em destaque disponível no momento.' }] };
    return {
      lines: [
        { type: 'text', text: 'FEATURED SIGNAL:' },
        { type: 'text', text: `${safeText(product.name)} — ${formatPrice(product.priceCents)}` },
        { type: 'muted', text: safeText(product.description, 'Sem descrição disponível.').slice(0, 180) },
        { type: 'link', text: 'Abrir página do produto', to: `/produto/${product.slug}`, label: 'abrir' },
      ],
    };
  }

  if (input === 'root') {
    const res = await rootAccessService.getPublic().catch(() => ({ data: null }));
    const cfg = res?.data;
    if (!cfg) return { lines: [{ type: 'muted', text: 'Módulo ROOT ACCESS indisponível no momento.' }] };
    const benefits = asArray(cfg.benefits).slice(0, 5);
    return {
      lines: [
        { type: 'text', text: `ROOT ACCESS — ${cfg.enabled ?'ATIVO' : 'INDISPONÍVEL'} · ${formatPrice(cfg.priceCents || 0)}/mês` },
        { type: 'muted', text: safeText(cfg.description, 'Programa de membros WIRED.exe.') },
        ...benefits.map((b) => ({ type: 'text', text: `- ${safeText(b?.title, 'Benefício')}` })),
        { type: 'link', text: 'Conhecer assinatura', to: '/root-access', label: 'abrir' },
      ],
    };
  }

  if (input === 'journal') {
    const res = await journalService.recent(5).catch(() => ({ data: [] }));
    const items = asArray(res?.data);
    if (!items.length) return { lines: [{ type: 'muted', text: 'WIRED Journal: nenhum artigo publicado no momento.' }, { type: 'link', text: 'Abrir WIRED Journal', to: '/journal', label: 'abrir' }] };
    return {
      lines: [
        { type: 'text', text: 'WIRED Journal — últimas publicações:' },
        ...items.map((a) => ({ type: 'link', text: `${safeText(a.title)} · ${safeText(a.category)}`, to: `/journal/${a.slug}`, label: 'ler' })),
        { type: 'link', text: 'Abrir WIRED Journal', to: '/journal', label: 'abrir' },
      ],
    };
  }

  if (input === 'profile') {
    if (ctx.isAuthenticated) {
      return {
        lines: [
          { type: 'text', text: 'WIRED ID detectado.' },
          { type: 'link', text: 'Abrir sua conta', to: '/conta', label: 'abrir' },
        ],
      };
    }
    return {
      lines: [
        { type: 'text', text: 'Nenhuma sessão autenticada.' },
        { type: 'link', text: 'Ir para login', to: '/login', label: 'abrir' },
      ],
    };
  }

  if (input === 'date') {
    return { lines: [{ type: 'text', text: new Date().toLocaleString('pt-BR') }] };
  }

  if (input === 'whoami') {
    if (!ctx.isAuthenticated || !ctx.user) return { lines: [{ type: 'text', text: 'guest' }] };
    const u = ctx.user;
    const handle = u.username ?`@${u.username}` : (u.displayName || u.name || 'user');
    const id = u.publicMemberId ?` · ${u.publicMemberId}` : '';
    const role = u.role ?` · ${u.role}` : '';
    return { lines: [{ type: 'text', text: `${handle}${id}${role}` }] };
  }

  if (input === 'clear') return { clear: true, lines: [] };
  if (input === 'exit') return { exit: true, lines: [{ type: 'muted', text: 'Encerrando sessão...' }] };
  if (input === 'matrix') return { effect: 'matrix', lines: [{ type: 'text', text: 'Wake up, operator...' }] };
  if (input === 'sudo') return { lines: [{ type: 'text', text: 'sudo: permission denied: nice try, operator.' }] };

  if (input === 'konami') return { effect: 'konami', lines: [{ type: 'text', text: '↑ ↑ ↓ ↓ ← → ← → B A — ACCESS GRANTED TO NOTHING.' }] };
  if (input === 'lain') return { lines: [{ type: 'text', text: 'Signal detected: the boundary between network and self is thinner than it looks. Stay wired.' }] };
  if (input === 'root access') return { effect: 'root', lines: [{ type: 'text', text: 'ACCESS GRANTED. (visual only — no real privileges changed)' }] };
  if (input === 'hack') return { effect: 'hack', lines: [{ type: 'text', text: 'Running fake intrusion sequence...' }, { type: 'muted', text: '...just kidding. Stay ethical.' }] };

  return { lines: [{ type: 'error', text: `Comando não reconhecido: ${raw}. Digite 'help'.` }] };
}
