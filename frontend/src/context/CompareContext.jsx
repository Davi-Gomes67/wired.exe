import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

const STORAGE_KEY = 'wired.exe.compare.v1';
const MAX_ITEMS = 4;
const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [ids, setIds] = useState(() => {
    const stored = readStorage(STORAGE_KEY, []);
    return Array.isArray(stored) ? stored.filter((id) => Number.isInteger(id)).slice(0, MAX_ITEMS) : [];
  });
  const [notice, setNotice] = useState('');

  useEffect(() => { writeStorage(STORAGE_KEY, ids); }, [ids]);
  useEffect(() => {
    if (!notice) return undefined;
    const t = window.setTimeout(() => setNotice(''), 2200);
    return () => window.clearTimeout(t);
  }, [notice]);

  const value = useMemo(() => ({
    ids,
    count: ids.length,
    max: MAX_ITEMS,
    notice,
    has: (id) => ids.includes(id),
    toggle: (id) => {
      setIds((prev) => {
        if (prev.includes(id)) return prev.filter((v) => v !== id);
        if (prev.length >= MAX_ITEMS) { setNotice(`Limite de ${MAX_ITEMS} produtos para comparar.`); return prev; }
        return [...prev, id];
      });
    },
    remove: (id) => setIds((prev) => prev.filter((v) => v !== id)),
    clear: () => setIds([]),
  }), [ids, notice]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare deve ser usado dentro de CompareProvider');
  return ctx;
};
