import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { adminService, getErrorMessage } from '../../services/api';

const FIELDS = [
  ['storeName', 'Nome da loja'],
  ['supportEmail', 'Email de suporte'],
  ['whatsapp', 'WhatsApp'],
  ['instagram', 'Instagram'],
  ['heroTitle', 'Título hero'],
  ['heroSubtitle', 'Subtítulo hero'],
  ['shippingInfo', 'Informação de frete'],
  ['returnPolicy', 'Política de troca/devolução'],
];

function AdminSettingsPage() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    let active = true;
    adminService.settings.get().then((r) => { if (active) setForm(r.data || {}); }).catch((e) => { if (active) setError(getErrorMessage(e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setOk('');
    try { const r = await adminService.settings.update(form); setForm(r.data); setOk('Configurações salvas.'); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div><p className="eyebrow">// admin</p><h1 className="section-title mt-2 text-3xl">Configurações</h1><p className="section-desc">Configurações persistidas no banco (tabela `settings`). Valores ausentes usam padrão do backend.</p></div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {ok && <p className="text-sm text-emerald-300">{ok}</p>}
      <form onSubmit={save} className="surface p-5 grid gap-4 sm:grid-cols-2">
        {FIELDS.map(([key, label]) => (
          <label key={key} className={`text-sm ${key.includes('hero') || key.includes('Policy') || key.includes('shipping') ? 'sm:col-span-2' : ''}`}>
            <span className="block text-muted mb-1">{label}</span>
            {key.includes('Policy') || key.includes('shipping') || key === 'heroSubtitle' ? (
              <textarea className="input-field min-h-24" value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} disabled={loading} />
            ) : (
              <input className="input-field" value={form[key] ?? ''} onChange={(e) => setForm({ ...form, [key]: e.target.value })} disabled={loading} />
            )}
          </label>
        ))}
        <div className="sm:col-span-2"><button className="btn-primary" disabled={loading || saving}><Save size={16} />{saving ? 'Salvando...' : 'Salvar configurações'}</button></div>
      </form>
    </div>
  );
}

export default AdminSettingsPage;
