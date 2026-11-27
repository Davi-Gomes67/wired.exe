import { useEffect, useState } from 'react';
import { Loader2, LogOut, MapPin, Plus, Save, Trash2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addressService, authService, getErrorMessage } from '../services/api';

const EMPTY_ADDRESS = {
  label: '', recipientName: '', phone: '', postalCode: '', addressLine1: '',
  addressLine2: '', district: '', city: '', state: '', isDefault: false,
};

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-sub">{label}</span>{children}</label>;
}

function AccountPage() {
  const { user, logout, refresh, getErrorMessage: authErr } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [pwdMsg, setPwdMsg] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDRESS);
  const [addrMsg, setAddrMsg] = useState('');
  const [loadingAddr, setLoadingAddr] = useState(true);

  useEffect(() => { setProfile({ name: user?.name || '', phone: user?.phone || '' }); }, [user]);
  useEffect(() => {
    let active = true;
    addressService.list().then((r) => { if (active) setAddresses(r.data); }).catch(() => {}).finally(() => { if (active) setLoadingAddr(false); });
    return () => { active = false; };
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault(); setProfileMsg('');
    try {
      await authService.updateProfile(profile);
      await refresh();
      setProfileMsg('Perfil atualizado.');
    } catch (err) { setProfileMsg(getErrorMessage(err)); }
  };

  const savePassword = async (e) => {
    e.preventDefault(); setPwdMsg('');
    try {
      await authService.changePassword(passwords);
      setPasswords({ currentPassword: '', newPassword: '' });
      setPwdMsg('Senha atualizada.');
    } catch (err) { setPwdMsg(getErrorMessage(err)); }
  };

  const addAddress = async (e) => {
    e.preventDefault(); setAddrMsg('');
    try {
      const payload = { ...addrForm, postalCode: addrForm.postalCode.replace(/\D/g, ''), state: addrForm.state.toUpperCase() };
      if (!payload.label) delete payload.label;
      if (!payload.phone) delete payload.phone;
      if (!payload.addressLine2) delete payload.addressLine2;
      const res = await addressService.create(payload);
      setAddresses((prev) => [res.data, ...prev.map((a) => payload.isDefault ?{ ...a, isDefault: false } : a)]);
      setAddrForm(EMPTY_ADDRESS);
      setAddrMsg('Endere?o salvo.');
    } catch (err) { setAddrMsg(getErrorMessage(err)); }
  };

  const removeAddress = async (id) => {
    try { await addressService.remove(id); setAddresses((prev) => prev.filter((a) => a.id !== id)); }
    catch (err) { setAddrMsg(getErrorMessage(err)); }
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">// conta</p>
          <h1 className="section-title mt-3">Minha conta</h1>
          <p className="section-desc">{user?.email}</p>
        </div>
        <button type="button" onClick={logout} className="btn-ghost"><LogOut size={16} /> Sair</button>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="surface p-5 sm:p-6">
          <div className="flex items-center gap-2 text-base"><User size={18} className="text-electric-light" /><h2 className="font-semibold">Perfil</h2></div>
          <form onSubmit={saveProfile} className="mt-5 space-y-4">
            <Field label="Nome"><input className="input-field" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required /></Field>
            <Field label="Telefone"><input className="input-field" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></Field>
            {profileMsg && <p className="text-xs text-sub">{profileMsg}</p>}
            <button className="btn-primary"><Save size={16} /> Salvar perfil</button>
          </form>
        </section>

        <section className="surface p-5 sm:p-6">
          <div className="flex items-center gap-2 text-base"><KeyRoundIcon /><h2 className="font-semibold">Seguran?a</h2></div>
          <form onSubmit={savePassword} className="mt-5 space-y-4">
            <Field label="Senha atual"><input className="input-field" type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required /></Field>
            <Field label="Nova senha"><input className="input-field" type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required /></Field>
            {pwdMsg && <p className="text-xs text-sub">{pwdMsg}</p>}
            <button className="btn-primary"><Save size={16} /> Alterar senha</button>
          </form>
        </section>

        <section className="surface p-5 sm:p-6 xl:col-span-2">
          <div className="flex items-center gap-2 text-base"><MapPin size={18} className="text-electric-light" /><h2 className="font-semibold">Endere?os</h2></div>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <form onSubmit={addAddress} className="grid gap-3 sm:grid-cols-2">
              <Field label="Identificador (opcional)"><input className="input-field" value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })} placeholder="Casa, trabalho..." /></Field>
              <Field label="Destinat?rio"><input className="input-field" required value={addrForm.recipientName} onChange={(e) => setAddrForm({ ...addrForm, recipientName: e.target.value })} /></Field>
              <Field label="CEP"><input className="input-field" required value={addrForm.postalCode} onChange={(e) => setAddrForm({ ...addrForm, postalCode: e.target.value })} /></Field>
              <Field label="Telefone"><input className="input-field" value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} /></Field>
              <div className="sm:col-span-2"><Field label="Endere?o"><input className="input-field" required value={addrForm.addressLine1} onChange={(e) => setAddrForm({ ...addrForm, addressLine1: e.target.value })} /></Field></div>
              <Field label="Complemento"><input className="input-field" value={addrForm.addressLine2} onChange={(e) => setAddrForm({ ...addrForm, addressLine2: e.target.value })} /></Field>
              <Field label="Bairro"><input className="input-field" required value={addrForm.district} onChange={(e) => setAddrForm({ ...addrForm, district: e.target.value })} /></Field>
              <Field label="Cidade"><input className="input-field" required value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} /></Field>
              <Field label="UF"><input className="input-field uppercase" required maxLength={2} value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} /></Field>
              <label className="flex items-center gap-2 text-sm text-sub sm:col-span-2"><input type="checkbox" checked={addrForm.isDefault} onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })} className="accent-[#8b5cf6]" /> Definir como padr?o</label>
              {addrMsg && <p className="text-xs text-sub sm:col-span-2">{addrMsg}</p>}
              <button className="btn-primary sm:col-span-2"><Plus size={16} /> Adicionar endere?o</button>
            </form>

            <div className="space-y-3">
              {loadingAddr ?<div className="text-sm text-muted"><Loader2 className="inline animate-spin" size={14} /> Carregando...</div> : null}
              {!loadingAddr && addresses.length === 0 && <p className="text-sm text-muted">Nenhum endere?o salvo.</p>}
              {addresses.map((a) => (
                <div key={a.id} className="rounded-xl border border-line bg-carbon/40 p-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-base">{a.label || a.recipientName} {a.isDefault && <span className="ml-2 text-[10px] text-electric-light">PADR?O</span>}</p>
                      <p className="text-muted">{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ''}</p>
                      <p className="text-muted">{a.district}, {a.city}/{a.state} - {a.postalCode}</p>
                    </div>
                    <button type="button" onClick={() => removeAddress(a.id)} className="text-muted hover:text-red-300"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function KeyRoundIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-electric-light"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>;
}

export default AccountPage;

