import { useEffect, useRef, useState } from 'react';
import { Loader2, LogOut, MapPin, Moon, Plus, Save, Sun, Trash2, Upload, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { addressService, authService, getErrorMessage } from '../../services/api';
import UserAvatar from '../../components/UserAvatar';
import AvatarCropModal from '../../components/account/AvatarCropModal';
import { useTheme } from '../../context/ThemeContext';

const EMPTY_ADDRESS = { label: '', recipientName: '', phone: '', postalCode: '', addressLine1: '', addressLine2: '', district: '', city: '', state: '', isDefault: false };
function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block text-xs font-medium text-sub">{label}</span>{children}</label>; }

export default function AccountSettingsPage() {
  const { user, logout, refresh } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState({ name: user?.name || '', displayName: user?.displayName || '', username: user?.username || '', phone: user?.phone || '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [pwdMsg, setPwdMsg] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDRESS);
  const [addrMsg, setAddrMsg] = useState('');
  const [loadingAddr, setLoadingAddr] = useState(true);
  const [avatarMsg, setAvatarMsg] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => { setProfile({ name: user?.name || '', displayName: user?.displayName || '', username: user?.username || '', phone: user?.phone || '' }); }, [user]);
  useEffect(() => { let active = true; addressService.list().then((r) => { if (active) setAddresses(r.data); }).catch(() => {}).finally(() => { if (active) setLoadingAddr(false); }); return () => { active = false; }; }, []);

  const saveProfile = async (e) => { e.preventDefault(); setProfileMsg(''); try { await authService.updateProfile({ ...profile, username: profile.username || null }); await refresh(); setProfileMsg('Perfil atualizado.'); } catch (err) { setProfileMsg(getErrorMessage(err)); } };
  const savePassword = async (e) => { e.preventDefault(); setPwdMsg(''); try { await authService.changePassword(passwords); setPasswords({ currentPassword: '', newPassword: '' }); setPwdMsg('Senha atualizada.'); } catch (err) { setPwdMsg(getErrorMessage(err)); } };
  const onAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarMsg('');
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) { setAvatarMsg('Formato inválido. Use PNG, JPEG, WebP ou GIF.'); e.target.value = ''; return; }
    if (file.size > 2 * 1024 * 1024) { setAvatarMsg('Imagem excede 2MB. Escolha um arquivo menor.'); e.target.value = ''; return; }
    setAvatarFile(file);
  };
  const saveAvatar = async (croppedFile) => {
    setAvatarLoading(true); setAvatarMsg('');
    try { await authService.uploadAvatar(croppedFile); await refresh(); setAvatarMsg('Avatar atualizado.'); setAvatarFile(null); }
    catch (err) { setAvatarMsg(getErrorMessage(err)); }
    finally { setAvatarLoading(false); if (avatarInputRef.current) avatarInputRef.current.value = ''; }
  };
  const addAddress = async (e) => { e.preventDefault(); setAddrMsg(''); try { const payload = { ...addrForm, postalCode: addrForm.postalCode.replace(/\D/g, ''), state: addrForm.state.toUpperCase() }; if (!payload.label) delete payload.label; if (!payload.phone) delete payload.phone; if (!payload.addressLine2) delete payload.addressLine2; const res = await addressService.create(payload); setAddresses((prev) => [res.data, ...prev.map((a) => payload.isDefault ?{ ...a, isDefault: false } : a)]); setAddrForm(EMPTY_ADDRESS); setAddrMsg('Endereço salvo.'); } catch (err) { setAddrMsg(getErrorMessage(err)); } };
  const removeAddress = async (id) => { try { await addressService.remove(id); setAddresses((prev) => prev.filter((a) => a.id !== id)); } catch (err) { setAddrMsg(getErrorMessage(err)); } };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">// settings</p><h1 className="section-title mt-3">Configurações</h1><p className="section-desc">{user?.email}</p></div><button type="button" onClick={logout} className="btn-ghost"><LogOut size={16} /> Sair</button></div>
      <section className="surface p-5 sm:p-6">
        <h2 className="font-semibold text-base">Aparência</h2>
        <p className="mt-1 text-sm text-muted">Escolha o tema da interface. A preferência fica salva neste dispositivo.</p>
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={() => setTheme('dark')} aria-pressed={theme === 'dark'} className={`btn-ghost ${theme === 'dark' ?'border-electric/50 text-base' : ''}`}><Moon size={16} /> Escuro</button>
          <button type="button" onClick={() => setTheme('light')} aria-pressed={theme === 'light'} className={`btn-ghost ${theme === 'light' ?'border-electric/50 text-base' : ''}`}><Sun size={16} /> Claro</button>
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="surface p-5 sm:p-6">
          <div className="flex items-center gap-2 text-base"><User size={18} className="text-electric-light" /><h2 className="font-semibold">Perfil WIRED ID</h2></div>
          <div className="mt-4 flex items-center gap-4">
            <UserAvatar src={user?.avatarUrl} name={user?.displayName || user?.name} size={64} />
            <label className={`btn-subtle min-h-10 px-3 text-xs cursor-pointer ${avatarLoading ?'opacity-60 pointer-events-none' : ''}`}>
              {avatarLoading ?<Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {avatarLoading ?'Enviando...' : 'Alterar avatar'}
              <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={onAvatarSelect} disabled={avatarLoading} />
            </label>
          </div>
          {avatarMsg && <p className="mt-2 text-xs text-sub">{avatarMsg}</p>}
          <AvatarCropModal file={avatarFile} onClose={() => { setAvatarFile(null); if (avatarInputRef.current) avatarInputRef.current.value = ''; }} onConfirm={saveAvatar} />
          <form onSubmit={saveProfile} className="mt-5 space-y-4">
            <Field label="Nome"><input className="input-field" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required /></Field>
            <Field label="Nome de exibição"><input className="input-field" value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} /></Field>
            <Field label="Username"><input className="input-field" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} placeholder="wired_user" /></Field>
            <Field label="Telefone"><input className="input-field" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></Field>
            {profileMsg && <p className="text-xs text-sub">{profileMsg}</p>}
            <button className="btn-primary"><Save size={16} /> Salvar perfil</button>
          </form>
        </section>
        <section className="surface p-5 sm:p-6">
          <div className="flex items-center gap-2 text-base"><ShieldIcon /><h2 className="font-semibold">Segurança</h2></div>
          <form onSubmit={savePassword} className="mt-5 space-y-4">
            <Field label="Senha atual"><input className="input-field" type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required /></Field>
            <Field label="Nova senha"><input className="input-field" type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required /></Field>
            {pwdMsg && <p className="text-xs text-sub">{pwdMsg}</p>}
            <button className="btn-primary"><Save size={16} /> Alterar senha</button>
          </form>
        </section>
      </div>
      <section className="surface p-5 sm:p-6">
        <div className="flex items-center gap-2 text-base"><MapPin size={18} className="text-electric-light" /><h2 className="font-semibold">Endereços</h2></div>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <form onSubmit={addAddress} className="grid gap-3 sm:grid-cols-2">
            <Field label="Identificador (opcional)"><input className="input-field" value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })} /></Field>
            <Field label="Destinatário"><input className="input-field" required value={addrForm.recipientName} onChange={(e) => setAddrForm({ ...addrForm, recipientName: e.target.value })} /></Field>
            <Field label="CEP"><input className="input-field" required value={addrForm.postalCode} onChange={(e) => setAddrForm({ ...addrForm, postalCode: e.target.value })} /></Field>
            <Field label="Telefone"><input className="input-field" value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Endereço"><input className="input-field" required value={addrForm.addressLine1} onChange={(e) => setAddrForm({ ...addrForm, addressLine1: e.target.value })} /></Field></div>
            <Field label="Complemento"><input className="input-field" value={addrForm.addressLine2} onChange={(e) => setAddrForm({ ...addrForm, addressLine2: e.target.value })} /></Field>
            <Field label="Bairro"><input className="input-field" required value={addrForm.district} onChange={(e) => setAddrForm({ ...addrForm, district: e.target.value })} /></Field>
            <Field label="Cidade"><input className="input-field" required value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} /></Field>
            <Field label="UF"><input className="input-field uppercase" required maxLength={2} value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm text-sub sm:col-span-2"><input type="checkbox" checked={addrForm.isDefault} onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })} className="accent-[#39FF70]" /> Definir como padrão</label>
            {addrMsg && <p className="text-xs text-sub sm:col-span-2">{addrMsg}</p>}
            <button className="btn-primary sm:col-span-2"><Plus size={16} /> Adicionar endereço</button>
          </form>
          <div className="space-y-3">
            {loadingAddr ?<div className="text-sm text-muted"><Loader2 className="inline animate-spin" size={14} /> Carregando...</div> : null}
            {!loadingAddr && addresses.length === 0 && <p className="text-sm text-muted">Nenhum endereço salvo.</p>}
            {addresses.map((a) => (<div key={a.id} className="rounded-xl border border-line bg-carbon/40 p-4 text-sm"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-base">{a.label || a.recipientName} {a.isDefault && <span className="ml-2 text-[10px] text-electric-light">PADRÃO</span>}</p><p className="text-muted">{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ''}</p><p className="text-muted">{a.district}, {a.city}/{a.state} - {a.postalCode}</p></div><button type="button" onClick={() => removeAddress(a.id)} className="text-muted hover:text-red-300"><Trash2 size={16} /></button></div></div>))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ShieldIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-electric-light"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>; }


