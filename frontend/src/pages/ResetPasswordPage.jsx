import { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService, getErrorMessage } from '../services/api';

function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ token: params.get('token') || '', password: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(form);
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-lg surface p-6 sm:p-8">
        <p className="eyebrow">// redefinição</p>
        <h1 className="section-title mt-3 text-3xl">Nova senha</h1>
        <p className="section-desc">Informe o token de simulação e sua nova senha.</p>

        {done ? (
          <div className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Senha redefinida com sucesso. <Link to="/login" className="underline">Fazer login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Token</span>
              <input className="input-field" required value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Nova senha</span>
              <input className="input-field" type="password" autoComplete="new-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </label>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
