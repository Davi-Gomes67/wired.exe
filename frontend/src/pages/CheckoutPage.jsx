import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, CreditCard, Loader2, LockKeyhole, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import Price from '../components/Price';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { addressService, cartService, getErrorMessage, ordersService } from '../services/api';
import { formatPrice } from '../utils/format';

const PAYMENT_OPTIONS = [
  { value: 'PIX_SIMULADO', label: 'Pix (simulação)', desc: 'Confirmação simulada, sem cobrança real.' },
  { value: 'BOLETO_SIMULADO', label: 'Boleto (simulação)', desc: 'Boleto demonstrativo, sem pagamento.' },
  { value: 'CARTAO_ENTREGA_SIMULADO', label: 'Cartão na entrega (simulação)', desc: 'Registro de intenção, sem transação.' },
];

function Field({ label, error, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-300">{error}</span>}
    </label>
  );
}

function CheckoutPage() {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [form, setForm] = useState({
    customerPhone: user?.phone || '', postalCode: '', addressLine1: '', addressLine2: '',
    district: '', city: '', state: '', paymentMethod: 'PIX_SIMULADO',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    let active = true;
    addressService.list().then((res) => {
      if (!active) return;
      setAddresses(res.data);
      const def = res.data.find((a) => a.isDefault) || res.data[0];
      if (def) {
        setSelectedAddressId(String(def.id));
        setForm((prev) => ({
          ...prev,
          customerPhone: def.phone || prev.customerPhone || '',
          postalCode: def.postalCode, addressLine1: def.addressLine1, addressLine2: def.addressLine2 || '',
          district: def.district, city: def.city, state: def.state,
        }));
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0), [items]);
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const applyAddress = (id) => {
    setSelectedAddressId(id);
    const addr = addresses.find((a) => String(a.id) === String(id));
    if (!addr) return;
    setForm((prev) => ({
      ...prev,
      customerPhone: addr.phone || prev.customerPhone || '',
      postalCode: addr.postalCode, addressLine1: addr.addressLine1, addressLine2: addr.addressLine2 || '',
      district: addr.district, city: addr.city, state: addr.state,
    }));
  };

  const validate = () => {
    const next = {};
    if (form.customerPhone && !/^[0-9()+\-\s]{8,20}$/.test(form.customerPhone.trim())) next.customerPhone = 'Telefone inválido.';
    if (!/^[0-9]{5}-?[0-9]{3}$/.test(form.postalCode.trim())) next.postalCode = 'CEP inválido.';
    if (form.addressLine1.trim().length < 4) next.addressLine1 = 'Informe o endereço.';
    if (form.district.trim().length < 2) next.district = 'Informe o bairro.';
    if (form.city.trim().length < 2) next.city = 'Informe a cidade.';
    if (!/^[A-Za-z]{2}$/.test(form.state.trim())) next.state = 'UF inválida.';
    if (!PAYMENT_OPTIONS.some((opt) => opt.value === form.paymentMethod)) next.paymentMethod = 'Selecione um método.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting || !validate()) return;
    setSubmitting(true);
    setServerError('');
    try {
      const cartItems = items.map((item) => ({ productId: item.id, quantity: item.quantity }));
      const validation = await cartService.validate(cartItems);
      if (!validation.data.valid) {
        setServerError('Alguns itens têm estoque insuficiente. Volte ao carrinho e ajuste as quantidades.');
        setSubmitting(false);
        return;
      }
      const payload = {
        customerPhone: form.customerPhone.trim() || undefined,
        postalCode: form.postalCode.replace(/\D/g, ''),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim() || undefined,
        district: form.district.trim(),
        city: form.city.trim(),
        state: form.state.trim().toUpperCase(),
        paymentMethod: form.paymentMethod,
        items: cartItems,
      };
      const response = await ordersService.create(payload);
      clearCart();
      navigate(`/pedido/${response.data.orderCode}`, { replace: true });
    } catch (requestError) {
      setServerError(getErrorMessage(requestError));
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return <div className="container-page py-12"><EmptyState icon={LockKeyhole} title="Nada para finalizar" description="Adicione produtos ao carrinho antes de abrir o checkout." actionTo="/catalogo" actionLabel="Explorar catálogo" /></div>;
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <Link to="/carrinho" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-[#D7EBDD]"><ArrowLeft size={16} /> Voltar ao carrinho</Link>
      <p className="eyebrow">// checkout</p>
      <h1 className="section-title mt-3">Finalizar pedido</h1>
      <p className="section-desc">Pedido vinculado à sua conta. Simulação: nenhum pagamento é processado.</p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="surface p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#D7EBDD]">Cliente</h2>
            <div className="mt-4 rounded-xl border border-line bg-carbon/40 p-4 text-sm text-slate-300">
              <p className="font-medium text-[#D7EBDD]">{user?.name}</p>
              <p>{user?.email}</p>
            </div>
            <div className="mt-4">
              <Field label="Telefone (opcional)" error={errors.customerPhone}><input className="input-field" value={form.customerPhone} onChange={set('customerPhone')} autoComplete="tel" maxLength={20} /></Field>
            </div>
          </section>

          <section className="surface p-5 sm:p-6">
            <div className="flex items-center gap-2"><MapPin size={18} className="text-electric-light" /><h2 className="text-lg font-semibold text-[#D7EBDD]">Endereço de entrega</h2></div>
            {addresses.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm text-slate-300 mb-2">Usar endereço salvo</label>
                <select className="input-field" value={selectedAddressId} onChange={(e) => applyAddress(e.target.value)}>
                  <option value="">Selecionar...</option>
                  {addresses.map((a) => <option key={a.id} value={a.id}>{a.label || a.recipientName} — {a.city}/{a.state}</option>)}
                </select>
              </div>
            )}
            <div className="mt-5 grid gap-4 sm:grid-cols-6">
              <Field label="CEP" error={errors.postalCode} className="sm:col-span-2"><input className="input-field" value={form.postalCode} onChange={set('postalCode')} required maxLength={9} /></Field>
              <Field label="Endereço" error={errors.addressLine1} className="sm:col-span-4"><input className="input-field" value={form.addressLine1} onChange={set('addressLine1')} required maxLength={160} /></Field>
              <Field label="Complemento" className="sm:col-span-3"><input className="input-field" value={form.addressLine2} onChange={set('addressLine2')} maxLength={120} /></Field>
              <Field label="Bairro" error={errors.district} className="sm:col-span-3"><input className="input-field" value={form.district} onChange={set('district')} required maxLength={100} /></Field>
              <Field label="Cidade" error={errors.city} className="sm:col-span-4"><input className="input-field" value={form.city} onChange={set('city')} required maxLength={100} /></Field>
              <Field label="UF" error={errors.state} className="sm:col-span-2"><input className="input-field uppercase" value={form.state} onChange={set('state')} required maxLength={2} /></Field>
            </div>
          </section>

          <section className="surface p-5 sm:p-6">
            <div className="flex items-center gap-2"><CreditCard size={18} className="text-electric-light" /><h2 className="text-lg font-semibold text-[#D7EBDD]">Pagamento (simulação)</h2></div>
            <p className="mt-1 text-xs text-muted">Nenhum pagamento real é processado.</p>
            <div className="mt-5 grid gap-3">
              {PAYMENT_OPTIONS.map((opt) => (
                <label key={opt.value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${form.paymentMethod === opt.value ? 'border-electric/60 bg-electric/10' : 'border-line bg-carbon/40 hover:border-electric/30'}`}>
                  <input type="radio" name="paymentMethod" value={opt.value} checked={form.paymentMethod === opt.value} onChange={set('paymentMethod')} className="mt-1 accent-[#8b5cf6]" />
                  <span><span className="block text-sm font-medium text-[#D7EBDD]">{opt.label}</span><span className="block text-xs text-muted">{opt.desc}</span></span>
                </label>
              ))}
            </div>
          </section>

          {serverError && <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"><AlertCircle size={17} className="mt-0.5 shrink-0" /><div><p>{serverError}</p><Link to="/carrinho" className="mt-2 inline-block text-electric-light underline">Revisar carrinho</Link></div></div>}
          <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">{submitting ? <><Loader2 size={17} className="animate-spin" /> Registrando...</> : 'Registrar pedido'}</button>
        </form>

        <aside className="surface h-fit p-5 xl:sticky xl:top-28">
          <h2 className="text-lg font-semibold text-[#D7EBDD]">Resumo</h2>
          <div className="mt-5 space-y-4 border-t border-line pt-5">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <span className="min-w-0 text-muted"><span className="block truncate text-slate-200">{item.name}</span><span className="font-mono text-xs">{item.quantity}x {formatPrice(item.priceCents)}</span></span>
                <Price cents={item.priceCents * item.quantity} className="shrink-0 text-slate-200" size="sm" />
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-line pt-5 flex justify-between text-sm"><span className="text-muted">Total</span><Price cents={subtotal} className="text-[#D7EBDD]" /></div>
          <p className="mt-4 rounded-lg bg-electric/10 p-3 text-[11px] text-slate-300">Preços confirmados no backend. Sem cobrança real.</p>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;
