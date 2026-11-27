import { useEffect } from 'react';

const upsertMeta = (attr, key, content) => {
  if (!content) return null;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  const prev = el.getAttribute('content');
  el.setAttribute('content', content);
  return { el, prev, created: prev === null };
};

export default function useDocumentMeta({ title, description, image, type = 'website' } = {}) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;
    const entries = [
      upsertMeta('name', 'description', description),
      upsertMeta('property', 'og:title', title),
      upsertMeta('property', 'og:description', description),
      upsertMeta('property', 'og:type', type),
      upsertMeta('property', 'og:image', image),
      upsertMeta('name', 'twitter:card', image ?'summary_large_image' : 'summary'),
      upsertMeta('name', 'twitter:title', title),
      upsertMeta('name', 'twitter:description', description),
    ].filter(Boolean);
    return () => {
      document.title = prevTitle;
      for (const { el, prev, created } of entries) {
        if (created) el.remove(); else if (prev !== null) el.setAttribute('content', prev);
      }
    };
  }, [title, description, image, type]);
}