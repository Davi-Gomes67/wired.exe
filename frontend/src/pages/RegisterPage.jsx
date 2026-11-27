import { useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-sub">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-300">{error}</span>}
    </label>
  );
}

function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/conta';
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) navigate(from, { replace: true });

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Informe seu nome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) next.email = 'E-mail inv?lido.';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) next.password = 'Use ao menos 8 caracteres com letra e n?mero.';
    if (form.phone && !/^[0-9()+\-\s]{8,20}$/.test(form.phone.trim())) next.phone = 'Telefone inv?lido.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError('');
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || undefined, password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-lg surface p-6 sm:p-8">
        <p className="eyebrow">// cadastro</p>
        <h1 className="section-title mt-3 text-3xl">Criar conta</h1>
        <p className="section-desc">Cadastre-se para salvar endere?os e acompanhar seus pedidos.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Field label="Nome completo" error={errors.name}><input className="input-field" autoComplete="name" required value={form.name} onChange={set('name')} /></Field>
          <Field label="E-mail" error={errors.email}><input className="input-field" type="email" autoComplete="email" required value={form.email} onChange={set('email')} /></Field>
          <Field label="Telefone (opcional)" error={errors.phone}><input className="input-field" autoComplete="tel" value={form.phone} onChange={set('phone')} /></Field>
          <Field label="Senha" error={errors.password}><input className="input-field" type="password" autoComplete="new-password" required value={form.password} onChange={set('password')} /></Field>
          {serverError && <p className="text-sm text-red-300">{serverError}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ?<Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {submitting ?'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-5 text-sm text-muted">J? tem conta?<Link to="/login" state={{ from: location.state?.from }} className="text-electric-light hover:underline">Entrar</Link></p>
      </div>
    </div>
  );
}

export default RegisterPage;

