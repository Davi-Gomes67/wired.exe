import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { accountService } from '../services/api';
import { readStorage, writeStorage } from '../utils/storage';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'wired.exe.wishlist.v1';
const WishlistContext = createContext(null);

const normalize = (item) => ({
  id: item.id,
  slug: item.slug,
  name: item.name,
  imageUrl: item.imageUrl || null,
  brand: item.brand || null,
  priceCents: Number(item.priceCents || 0),
  stock: Number(item.stock || 0),
  category: item.category ?{ name: item.category.name, slug: item.category.slug } : null,
});

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => {
    const stored = readStorage(STORAGE_KEY, []);
    return Array.isArray(stored) ? stored.filter((i) => i && typeof i.id === 'number').map(normalize) : [];
  });

  useEffect(() => { if (!isAuthenticated) writeStorage(STORAGE_KEY, items); }, [items, isAuthenticated]);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) return undefined;
    const localIds = (readStorage(STORAGE_KEY, []) || []).map((i) => i.id).filter((id) => Number.isInteger(id));
    (async () => {
      try {
        if (localIds.length) await accountService.syncWishlist(localIds);
        const res = await accountService.wishlist();
        if (active) {
          setItems((res.data || []).map(normalize));
          writeStorage(STORAGE_KEY, []);
        }
      } catch {
        // keep local state on failure
      }
    })();
    return () => { active = false; };
  }, [isAuthenticated]);

  const value = useMemo(() => ({
    items,
    count: items.length,
    has: (id) => items.some((item) => item.id === id),
    toggle: (product) => {
      const exists = items.some((i) => i.id === product.id);
      setItems((prev) => exists ? prev.filter((i) => i.id !== product.id) : [...prev, normalize(product)]);
      if (isAuthenticated) {
        const req = exists ? accountService.removeWishlist(product.id) : accountService.addWishlist(product.id);
        req.then((res) => setItems((res.data || []).map(normalize))).catch(() => {});
      }
    },
    remove: (id) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (isAuthenticated) accountService.removeWishlist(id).then((res) => setItems((res.data || []).map(normalize))).catch(() => {});
    },
    clear: () => setItems([]),
  }), [items, isAuthenticated]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist deve ser usado dentro de WishlistProvider');
  return ctx;
};
