import { resolveAssetUrl } from '../../utils/asset-url';

const safeHref = (href) => {
  if (typeof href !== 'string') return null;
  const v = href.trim();
  if (/^(https?:\/\/|\/)/i.test(v)) return v;
  return null;
};

function Inline({ text = '' }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-semibold text-base">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="italic text-sub">{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="rounded bg-black/5 dark:bg-white/5 px-1.5 py-0.5 font-mono text-[0.92em] text-electric-light">{part.slice(1, -1)}</code>;
    return <span key={i}>{part}</span>;
  });
}

export default function JournalBlocks({ blocks = [] }) {
  if (!Array.isArray(blocks) || !blocks.length) return <p className="text-sm text-muted">Sem conte?do editorial.</p>;
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        const key = `${block?.type || 'block'}-${i}`;
        if (block?.type === 'heading') return <h2 key={key} className="pt-4 font-display text-2xl font-bold tracking-tight text-base sm:text-3xl"><Inline text={block.text} /></h2>;
        if (block?.type === 'subheading') return <h3 key={key} className="pt-2 font-display text-xl font-semibold tracking-tight text-base"><Inline text={block.text} /></h3>;
        if (block?.type === 'paragraph') return <p key={key} className="text-base leading-8 text-sub"><Inline text={block.text} /></p>;
        if (block?.type === 'quote') return <blockquote key={key} className="border-l-2 border-electric/50 pl-5 text-lg leading-8 text-[#CFE7D6]"><p><Inline text={block.text} /></p>{block.cite ?<footer className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-muted">{block.cite}</footer> : null}</blockquote>;
        if (block?.type === 'code') return <pre key={key} className="overflow-x-auto rounded-xl border border-line bg-[#050805] p-4 font-mono text-sm leading-6 text-electric-light"><code>{block.text}</code></pre>;
        if (block?.type === 'divider') return <hr key={key} className="border-line/80" />;
        if (block?.type === 'list') {
          const ListTag = block.ordered ?'ol' : 'ul';
          return (
            <ListTag key={key} className={`space-y-2 pl-6 text-base leading-7 text-sub ${block.ordered ?'list-decimal' : 'list-disc'}`}>
              {(Array.isArray(block.items) ? block.items : []).map((item, j) => <li key={j}><Inline text={item} /></li>)}
            </ListTag>
          );
        }
        if (block?.type === 'image') {
          const src = resolveAssetUrl(block.url);
          if (!src) return null;
          return (
            <figure key={key} className="space-y-3">
              <img src={src} alt={block.alt || 'Imagem do artigo'} loading="lazy" className="w-full rounded-2xl border border-line object-cover" />
              {block.caption ?<figcaption className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{block.caption}</figcaption> : null}
            </figure>
          );
        }
        if (block?.type === 'link') {
          const href = safeHref(block.href);
          if (!href) return null;
          const external = /^https?:\/\//i.test(href);
          return <p key={key}><a href={href} target={external ?'_blank' : undefined} rel={external ?'noreferrer noopener' : undefined} className="text-electric-light underline decoration-electric/30 underline-offset-4 hover:text-base">{block.text || href}</a></p>;
        }
        return null;
      })}
    </div>
  );
}
