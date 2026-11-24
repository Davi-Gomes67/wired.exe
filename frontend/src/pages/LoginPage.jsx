import { useState } from 'react';
import { Loader2, LogIn } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-300">{error}</span>}
    </label>
  );
}

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/conta';
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    navigate(from, { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-lg surface p-6 sm:p-8">
        <p className="eyebrow">// acesso</p>
        <h1 className="section-title mt-3 text-3xl">Entrar</h1>
        <p className="section-desc">Acesse sua conta para acompanhar pedidos e finalizar compras.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Field label="E-mail">
            <input className="input-field" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Senha">
            <input className="input-field" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-5 flex flex-col gap-2 text-sm text-muted">
          <Link to="/recuperar-senha" className="text-electric-light hover:underline">Esqueci minha senha</Link>
          <p>Não tem conta? <Link to="/cadastro" state={{ from: location.state?.from }} className="text-electric-light hover:underline">Cadastre-se</Link></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
