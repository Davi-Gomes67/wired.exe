import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService, getErrorMessage, setAuthToken, setUnauthorizedHandler } from '../services/api';

const STORAGE_KEY = 'wired.exe.auth.v1';
const AuthContext = createContext(null);

const readStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed?.token || !parsed?.user) return { token: null, user: null };
    return { token: parsed.token, user: parsed.user };
  } catch {
    return { token: null, user: null };
  }
};

export function AuthProvider({ children }) {
  const stored = readStoredAuth();
  const [token, setToken] = useState(stored.token);
  const [user, setUser] = useState(stored.user);
  const [loading, setLoading] = useState(Boolean(stored.token));

  useEffect(() => {
    setAuthToken(token);
    if (token && user) localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    else localStorage.removeItem(STORAGE_KEY);
  }, [token, user]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
      setAuthToken(null);
      localStorage.removeItem(STORAGE_KEY);
    });
  }, []);

  useEffect(() => {
    let active = true;
    if (!token) { setLoading(false); return undefined; }
    authService.me()
      .then((res) => { if (active) setUser(res.data); })
      .catch(() => {
        if (!active) return;
        setToken(null); setUser(null); setAuthToken(null); localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    async login(payload) {
      const res = await authService.login(payload);
      setToken(res.data.token); setUser(res.data.user); setAuthToken(res.data.token);
      return res.data;
    },
    async register(payload) {
      const res = await authService.register(payload);
      setToken(res.data.token); setUser(res.data.user); setAuthToken(res.data.token);
      return res.data;
    },
    logout() {
      setToken(null); setUser(null); setAuthToken(null); localStorage.removeItem(STORAGE_KEY);
    },
    async refresh() {
      const res = await authService.me();
      setUser(res.data);
      return res.data;
    },
    setUser,
    getErrorMessage,
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return ctx;
}
