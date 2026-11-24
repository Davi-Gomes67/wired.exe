import { useEffect, useState } from 'react';
import { ImageOff, RefreshCw, Trash2 } from 'lucide-react';
import { adminService, getErrorMessage } from '../../services/api';

function AdminMediaPage() {
  const [data, setData] = useState({ images: [], total: 0, noImageProducts: [], orphanFiles: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { const r = await adminService.media.list(); setData(r.data); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const removeImage = async (id) => {
    if (!confirm('Remover esta imagem do produto?')) return;
    try { await adminService.products.removeImage(id); load(); } catch (e) { setError(getErrorMessage(e)); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">// admin</p><h1 className="section-title mt-2 text-3xl">Biblioteca de Mídia</h1><p className="section-desc">Imagens vinculadas a produtos, produtos sem imagem e arquivos órfãos em uploads/products.</p></div>
        <button className="btn-subtle" onClick={load}><RefreshCw size={15} /> Atualizar</button>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="surface p-4"><p className="text-xs text-muted uppercase">Imagens vinculadas</p><p className="mt-2 text-2xl font-bold text-[#D7EBDD]">{data.total}</p></div>
        <div className="surface p-4"><p className="text-xs text-muted uppercase">Produtos sem imagem</p><p className="mt-2 text-2xl font-bold text-[#D7EBDD]">{data.noImageProducts.length}</p></div>
        <div className="surface p-4"><p className="text-xs text-muted uppercase">Arquivos órfãos</p><p className="mt-2 text-2xl font-bold text-[#D7EBDD]">{data.orphanFiles.length}</p></div>
      </div>

      <section className="surface p-5">
        <h2 className="font-semibold text-[#D7EBDD]">Produtos sem imagem</h2>
        <div className="mt-3 space-y-2">
          {loading ? <p className="text-sm text-muted">Carregando...</p> : data.noImageProducts.length === 0 ? <p className="text-sm text-muted">Nenhum produto ativo sem imagem.</p> : data.noImageProducts.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b border-line/50 py-2 text-sm"><span className="text-slate-200">{p.name}</span><span className="text-xs text-muted font-mono">{p.slug}</span></div>
          ))}
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="font-semibold text-[#D7EBDD]">Imagens vinculadas</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {!loading && data.images.length === 0 && <p className="text-sm text-muted">Nenhuma imagem vinculada.</p>}
          {data.images.map((img) => (
            <div key={img.id} className="rounded-xl border border-line bg-carbon/30 overflow-hidden">
              {img.url ? <img src={img.url} alt={img.alt || ''} className="h-36 w-full object-cover" /> : <div className="h-36 flex items-center justify-center text-muted"><ImageOff /></div>}
              <div className="p-3 text-xs space-y-2">
                <div className="text-[#D7EBDD] truncate">{img.product?.name || 'Produto'}</div>
                <div className="text-muted truncate font-mono">{img.url}</div>
                <button className="btn-subtle h-8 px-2 text-red-300" onClick={() => removeImage(img.id)}><Trash2 size={13} /> Remover</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="surface p-5">
        <h2 className="font-semibold text-[#D7EBDD]">Arquivos órfãos</h2>
        <p className="text-xs text-muted mt-1">Arquivos presentes em `uploads/products` sem referência em `product_images`. Não são apagados automaticamente.</p>
        <div className="mt-3 space-y-2">
          {data.orphanFiles.length === 0 ? <p className="text-sm text-muted">Nenhum órfão detectado.</p> : data.orphanFiles.map((f) => (
            <div key={f.name} className="flex items-center justify-between text-xs border-b border-line/50 py-2"><span className="font-mono text-slate-300">{f.url}</span><span className="text-muted">{Math.round(f.bytes/1024)} KB</span></div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminMediaPage;
