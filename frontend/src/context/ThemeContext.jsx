import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'wired.exe.theme';

const getInitial = () => {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark';
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ?'#080D09' : '#F3F7F4');
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme: (next) => setThemeState(next === 'light' ?'light' : 'dark'),
    toggleTheme: () => setThemeState((t) => (t === 'dark' ?'light' : 'dark')),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider.');
  return ctx;
};
