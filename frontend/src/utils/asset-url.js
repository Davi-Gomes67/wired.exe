export const resolveAssetUrl = (url) => {
  if (!url) return '';
  if (/^(https?:\/\/|data:|blob:)/i.test(url)) return url;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '');
  if (url.startsWith('/uploads/')) return `${base}${url}`;
  return url;
};
