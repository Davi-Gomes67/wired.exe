import { useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService, getErrorMessage } from '../services/api';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await authService.forgotPassword({ email });
      setResult(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-lg surface p-6 sm:p-8">
        <p className="eyebrow">// recuperação</p>
        <h1 className="section-title mt-3 text-3xl">Recuperar senha</h1>
        <p className="section-desc">Simulação: o token de redefinição será exibido aqui, sem envio real de e-mail.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">E-mail</span>
            <input className="input-field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
            {loading ? 'Gerando...' : 'Gerar token de redefinição'}
          </button>
        </form>

        {result && (
          <div className="mt-6 rounded-xl border border-electric/30 bg-electric/10 p-4 text-sm text-slate-200">
            <p>{result.message}</p>
            {result.resetToken && (
              <>
                <p className="mt-3 text-xs text-muted">Token (simulação):</p>
                <code className="mt-1 block break-all rounded bg-black/30 p-2 text-xs text-electric-light">{result.resetToken}</code>
                <Link to={`/redefinir-senha?token=${encodeURIComponent(result.resetToken)}`} className="mt-3 inline-block text-electric-light underline">
                  Usar token para redefinir senha
                </Link>
              </>
            )}
          </div>
        )}

        <p className="mt-5 text-sm text-muted"><Link to="/login" className="text-electric-light hover:underline">Voltar ao login</Link></p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
