import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setStatus({ type: 'error', message: 'Informe um e-mail válido para receber novidades.' });
      return;
    }
    setStatus({
      type: 'success',
      message: 'Inscrição registrada localmente (demo). Nenhum e-mail foi enviado.',
    });
    setEmail('');
  };

  return (
    <section className="relative overflow-hidden border-y border-line bg-carbon/70 py-14 sm:py-16">
      <div className="absolute inset-0 bg-grid opacity-25 [background-size:32px_32px]" />
      <div className="absolute left-1/2 top-0 h-40 w-[32rem] -translate-x-1/2 rounded-full bg-electric/10 blur-3xl" />
      <div className="container-page relative">
        <div className="surface mx-auto max-w-4xl overflow-hidden p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="eyebrow">Newsletter</p>
              <h2 className="section-title mt-3">Fique no sinal da WIRED.</h2>
              <p className="section-desc">
                Receba lançamentos, drops e curadoria geek. Nesta versão demonstrativa, o formulário valida o e-mail e exibe confirmação local.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block">
                <span className="sr-only">E-mail</span>
                <div className="relative">
                  <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (status.message) setStatus({ type: '', message: '' }); }}
                    placeholder="seu@email.com"
                    className="input-field pl-11 pr-4"
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
              </label>
              <button type="submit" className="btn-primary w-full sm:w-auto">
                Inscrever <Send size={15} />
              </button>
              <p className={`min-h-5 text-xs ${status.type === 'error' ?'text-red-300' : 'text-electric-light'}`} aria-live="polite">
                {status.message}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
