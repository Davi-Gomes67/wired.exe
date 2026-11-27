import { useEffect, useState } from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import { adminService, getErrorMessage } from '../../services/api';
import { formatDate, formatPrice } from '../../utils/format';

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

const ROOT_FIELDS = [
  ['rootAccessPriceCents', 'Preço mensal (centavos)', 'number'],
  ['rootAccessCampaignImage', 'Imagem da campanha (path público)', 'text'],
  ['rootAccessDescription', 'Descrição', 'textarea'],
  ['rootAccessConditions', 'Condições da assinatura', 'textarea'],
  ['rootAccessBenefits', 'Benefícios (JSON: [{title,description}])', 'textarea'],
  ['rootAccessFaq', 'FAQ (JSON: [{question,answer}])', 'textarea'],
];

const STATUS_OPTIONS = ['PENDING', 'ACTIVE', 'CANCELLED', 'EXPIRED'];

function AdminSettingsPage() {
  const [form, setForm] = useState({});
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [settingsRes, subsRes] = await Promise.all([adminService.settings.get(), adminService.rootAccess.list()]);
      setForm(settingsRes.data || {});
      setSubs(subsRes.data || []);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setOk('');
    try {
      const payload = { ...form };
      ['rootAccessEnabled', 'rootAccessOfferCart', 'rootAccessOfferCheckout', 'rootAccessOfferPostPurchase'].forEach((k) => { payload[k] = String(payload[k]) === 'true'; });
      const r = await adminService.settings.update(payload);
      setForm(r.data || {});
      setOk('Configurações salvas.');
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  const updateSubStatus = async (id, status) => {
    setError(''); setOk('');
    try {
      await adminService.rootAccess.updateStatus(id, status);
      setSubs((prev) => prev.map((s) => (s.id === id ?{ ...s, status } : s)));
      setOk('Status da assinatura atualizado.');
    } catch (err) { setError(getErrorMessage(err)); }
  };

  const boolField = (key, label) => (
    <label key={key} className="flex items-center gap-3 rounded-xl border border-line bg-carbon/30 p-4 text-sm">
      <input type="checkbox" checked={String(form[key]) === 'true'} onChange={(e) => set(key, e.target.checked ?'true' : 'false')} disabled={loading} className="accent-[#39FF70]" />
      <span>{label}</span>
    </label>
  );

  return (
    <div className="space-y-6">
      <div><p className="eyebrow">// admin</p><h1 className="section-title mt-2 text-3xl">Configurações</h1><p className="section-desc">Configurações persistidas no banco (tabela `settings`). Valores ausentes usam padrão do backend.</p></div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {ok && <p className="text-sm text-emerald-300">{ok}</p>}

      <form onSubmit={save} className="space-y-6">
        <section className="surface p-5">
          <h2 className="text-lg font-semibold text-base">Loja</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {FIELDS.map(([key, label]) => (
              <label key={key} className={`text-sm ${key.includes('hero') || key.includes('Policy') || key.includes('shipping') ?'sm:col-span-2' : ''}`}>
                <span className="block text-muted mb-1">{label}</span>
                {key.includes('Policy') || key.includes('shipping') || key === 'heroSubtitle' ?(
                  <textarea className="input-field min-h-24" value={form[key] ?? ''} onChange={(e) => set(key, e.target.value)} disabled={loading} />
                ) : (
                  <input className="input-field" value={form[key] ?? ''} onChange={(e) => set(key, e.target.value)} disabled={loading} />
                )}
              </label>
            ))}
          </div>
        </section>

        <section className="surface p-5">
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-electric-light" /><h2 className="text-lg font-semibold text-base">ROOT ACCESS</h2></div>
          <p className="mt-1 text-sm text-muted">Programa de membros. Sem integração de pagamento recorrente: solicitações são registradas como PENDING e não há cobrança automática.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {boolField('rootAccessEnabled', 'Programa ROOT ACCESS habilitado')}
            {boolField('rootAccessOfferCart', 'Exibir oferta no carrinho')}
            {boolField('rootAccessOfferCheckout', 'Exibir oferta no checkout')}
            {boolField('rootAccessOfferPostPurchase', 'Exibir oferta pós-compra')}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {ROOT_FIELDS.map(([key, label, type]) => (
              <label key={key} className={`text-sm ${type === 'textarea' ?'sm:col-span-2' : ''}`}>
                <span className="block text-muted mb-1">{label}</span>
                {type === 'textarea' ?(
                  <textarea className="input-field min-h-28 font-mono text-xs" value={form[key] ?? ''} onChange={(e) => set(key, e.target.value)} disabled={loading} />
                ) : (
                  <input className="input-field" type={type === 'number' ?'number' : 'text'} min={type === 'number' ?0 : undefined} value={form[key] ?? ''} onChange={(e) => set(key, e.target.value)} disabled={loading} />
                )}
              </label>
            ))}
          </div>
        </section>

        <div><button className="btn-primary" disabled={loading || saving}><Save size={16} />{saving ?'Salvando...' : 'Salvar configurações'}</button></div>
      </form>

      <section className="surface p-5">
        <h2 className="text-lg font-semibold text-base">Solicitações ROOT ACCESS</h2>
        <p className="mt-1 text-sm text-muted">Registros reais. Sem cobrança automática; status controlado manualmente até integração de pagamento.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="border-b border-line text-left text-muted"><th className="py-2 pr-3">ID</th><th className="py-2 pr-3">Cliente</th><th className="py-2 pr-3">Origem</th><th className="py-2 pr-3">Pedido</th><th className="py-2 pr-3">Preço</th><th className="py-2 pr-3">Criado</th><th className="py-2 pr-3">Status</th></tr></thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-line/50 align-top">
                  <td className="py-3 pr-3 font-mono text-xs">{s.id}</td>
                  <td className="py-3 pr-3"><div className="text-base">{s.user?.name || '—'}</div><div className="text-xs text-muted">{s.email}</div></td>
                  <td className="py-3 pr-3">{s.source}</td>
                  <td className="py-3 pr-3 font-mono text-xs">{s.orderCode || '—'}</td>
                  <td className="py-3 pr-3">{formatPrice(s.priceCents)}</td>
                  <td className="py-3 pr-3 text-xs text-muted">{formatDate(s.createdAt)}</td>
                  <td className="py-3 pr-3">
                    <select className="input-field max-w-[160px]" value={s.status} onChange={(e) => updateSubStatus(s.id, e.target.value)}>
                      {STATUS_OPTIONS.map((st) => <option key={st} value={st}>{st}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {!subs.length && !loading && <tr><td colSpan={7} className="py-6 text-center text-muted">Nenhuma solicitação ROOT ACCESS registrada.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminSettingsPage;

