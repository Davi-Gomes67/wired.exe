import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertCircle, BarChart3, Database, DollarSign, ImageOff, Package, RefreshCw, ShoppingBag, Star, Tags, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService, getErrorMessage } from '../../services/api';
import { formatDate, formatPrice } from '../../utils/format';

const RANGES = [{ v: '7d', l: '7 dias' }, { v: '30d', l: '30 dias' }, { v: '90d', l: '90 dias' }, { v: '12m', l: '12 meses' }];
const COLORS = ['#39FF70', '#7CFF9C', '#1FA64A', '#5EEAD4', '#A78BFA', '#F59E0B', '#FB7185', '#60A5FA'];

function Kpi({ icon: Icon, label, value, sub, to }) {
  const body = (
    <div className="surface p-4 h-full">
      <div className="flex items-center justify-between text-muted"><span className="text-xs uppercase tracking-wider">{label}</span><Icon size={16} className="text-electric-light" /></div>
      <p className="mt-3 text-2xl font-bold text-[#D7EBDD]">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
  return to ? <Link to={to} className="block hover:opacity-95">{body}</Link> : body;
}

function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  let acc = 0;
  const stops = data.map((d, i) => {
    const start = (acc / total) * 360; acc += d.count; const end = (acc / total) * 360;
    return `${COLORS[i % COLORS.length]} ${start}deg ${end}deg`;
  }).join(', ');
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center">
      <div className="relative h-44 w-44 shrink-0 rounded-full" style={{ background: `conic-gradient(${stops || '#243128 0deg 360deg'})` }}>
        <div className="absolute inset-6 rounded-full bg-panel flex items-center justify-center text-center">
          <div><div className="text-2xl font-bold text-[#D7EBDD]">{total}</div><div className="text-[11px] text-muted uppercase">produtos</div></div>
        </div>
      </div>
      <div className="flex-1 space-y-2 w-full">
        {data.map((d, i) => (
          <div key={d.slug || d.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0"><span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} /><span className="text-slate-300 truncate">{d.name}</span></div>
            <span className="text-muted shrink-0 ml-2">{d.count} • {d.percent}%</span>
          </div>
        ))}
        {data.length === 0 && <p className="text-sm text-muted">Sem dados de categorias.</p>}
      </div>
    </div>
  );
}

function LineChart({ buckets }) {
  const max = Math.max(1, ...buckets.map(b => b.count));
  const w = 700; const h = 220; const pad = 28;
  const points = buckets.map((b, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(1, buckets.length - 1);
    const y = h - pad - (b.count / max) * (h - pad * 2);
    return { x, y, ...b };
  });
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-56">
        <line x1={pad} y1={h-pad} x2={w-pad} y2={h-pad} stroke="#243128" />
        <line x1={pad} y1={pad} x2={pad} y2={h-pad} stroke="#243128" />
        {d && <path d={d} fill="none" stroke="#39FF70" strokeWidth="2.5" />}
        {points.map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r="3.5" fill="#7CFF9C" /><title>{`${p.label}: ${p.count} produto(s)`}</title></g>)}
      </svg>
      <div className="flex justify-between text-[11px] text-muted px-2"><span>{buckets[0]?.label}</span><span>{buckets[buckets.length-1]?.label}</span></div>
    </div>
  );
}

function HBars({ data }) {
  const max = Math.max(1, ...data.map(d => d.count));
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.slug || d.name}>
          <div className="mb-1 flex justify-between text-xs text-muted"><span className="truncate mr-2">{d.name}</span><span>{d.count}</span></div>
          <div className="h-2.5 rounded-full bg-white/5"><div className="h-2.5 rounded-full" style={{ width: `${(d.count/max)*100}%`, background: COLORS[i % COLORS.length] }} /></div>
        </div>
      ))}
      {data.length === 0 && <p className="text-sm text-muted">Sem dados.</p>}
    </div>
  );
}

function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  const load = async (r = range) => {
    setLoading(true); setError('');
    try { const res = await adminService.dashboard({ registrationRange: r }); setData(res.data); }
    catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load('30d'); }, []);

  const reg = data?.productRegistration;
  const hasRegData = useMemo(() => (reg?.buckets || []).some(b => b.count > 0), [reg]);

  if (error) return <div className="surface p-5 text-red-300 flex gap-2"><AlertCircle size={18} />{error}<button className="ml-auto btn-subtle h-8 px-3" onClick={() => load()}>Tentar novamente</button></div>;
  if (loading || !data) return <div className="space-y-4"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({length:8}).map((_,i)=><div key={i} className="skeleton h-28 rounded-2xl" />)}</div><div className="skeleton h-72 rounded-2xl" /></div>;

  const { kpis, mediaHealth, systemHealth } = data;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">// admin</p><h1 className="section-title mt-2 text-3xl">Dashboard 2.0</h1><p className="section-desc">Indicadores e análises baseados em dados reais do banco.</p></div>
        <button className="btn-subtle" onClick={() => load()}><RefreshCw size={15} /> Atualizar</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Package} label="Total produtos" value={kpis.productsCount} sub={`${kpis.activeProducts} ativos`} to="/admin/produtos" />
        <Kpi icon={Tags} label="Categorias" value={kpis.totalCategories} sub="Departamentos reais" to="/admin/categorias" />
        <Kpi icon={Star} label="Destaques" value={kpis.featuredCount} sub="Produtos em destaque" to="/admin/destaques" />
        <Kpi icon={ImageOff} label="Sem imagem" value={kpis.noImageCount} sub="Produtos ativos" to="/admin/midia" />
        <Kpi icon={AlertCircle} label="Sem descrição" value={kpis.noDescriptionCount ?? 0} sub="Revisar cadastro" to="/admin/produtos" />
        <Kpi icon={BarChart3} label="Imagens" value={kpis.totalImages} sub="Registros em product_images" to="/admin/midia" />
        <Kpi icon={Activity} label="Recentes (7d)" value={kpis.recentlyAdded7d ?? 0} sub="Produtos cadastrados" to="/admin/produtos" />
        <Kpi icon={DollarSign} label="Receita" value={formatPrice(kpis.totalRevenueCents)} sub={`Ticket médio ${formatPrice(kpis.averageTicketCents)}`} to="/admin/pedidos" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="surface p-5">
          <div className="flex items-center justify-between gap-3 mb-4"><h2 className="font-semibold text-[#D7EBDD]">Category Distribution</h2></div>
          <Donut data={data.categoryDistribution || []} />
        </section>

        <section className="surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold text-[#D7EBDD]">Product Registration</h2>
            <div className="flex gap-2 flex-wrap">{RANGES.map(r => <button key={r.v} className={`btn-subtle h-8 px-3 text-xs ${range===r.v?'ring-1 ring-electric/40 text-[#D7EBDD]':''}`} onClick={() => { setRange(r.v); load(r.v); }}>{r.l}</button>)}</div>
          </div>
          {hasRegData ? <LineChart buckets={reg?.buckets || []} /> : <p className="text-sm text-muted">Sem histórico suficiente no período selecionado. Dados exibidos apenas quando houver cadastros reais.</p>}
          <p className="mt-2 text-xs text-muted">Total no período: {reg?.totalInRange ?? 0} | bucket: {reg?.bucket}</p>
        </section>

        <section className="surface p-5">
          <h2 className="font-semibold text-[#D7EBDD] mb-4">Department Comparison</h2>
          <HBars data={data.departmentComparison || []} />
        </section>

        <section className="surface p-5">
          <h2 className="font-semibold text-[#D7EBDD] mb-4">Media Health</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-line bg-carbon/40 p-3"><div className="text-muted text-xs">Com imagem</div><div className="text-xl font-bold text-[#D7EBDD]">{mediaHealth.withImage}</div></div>
            <div className="rounded-xl border border-line bg-carbon/40 p-3"><div className="text-muted text-xs">Sem imagem</div><div className="text-xl font-bold text-amber-300">{mediaHealth.withoutImage}</div></div>
            <div className="rounded-xl border border-line bg-carbon/40 p-3"><div className="text-muted text-xs">Imagens órfãs</div><div className="text-xl font-bold text-[#D7EBDD]">{mediaHealth.orphanFiles}</div></div>
            <div className="rounded-xl border border-line bg-carbon/40 p-3"><div className="text-muted text-xs">Refs inválidas</div><div className="text-xl font-bold text-red-300">{mediaHealth.invalidImageRefs}</div></div>
          </div>
          <p className="mt-3 text-xs text-muted">Refs inválidas: registros em `product_images` cujo arquivo local não foi encontrado em `uploads/products`.</p>
        </section>

        <section className="surface p-5">
          <h2 className="font-semibold text-[#D7EBDD] mb-4">Featured Products</h2>
          <div className="space-y-3">
            {(data.featuredProducts || []).length === 0 && <p className="text-sm text-muted">Nenhum produto em destaque.</p>}
            {(data.featuredProducts || []).map((p) => (
              <div key={p.id} className="flex items-center gap-3 border-b border-line/50 pb-3 last:border-0 last:pb-0">
                {p.imageUrl ? <img src={p.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover border border-line" /> : <div className="h-12 w-12 rounded-lg bg-white/5 border border-line" />}
                <div className="min-w-0 flex-1"><div className="text-sm text-[#D7EBDD] truncate">{p.name}</div><div className="text-xs text-muted truncate">{p.category?.name}</div></div>
                <Link to={`/produto/${p.slug}`} className="text-xs text-electric-light hover:underline">Ver</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="surface p-5">
          <h2 className="font-semibold text-[#D7EBDD] mb-4">Activity Log</h2>
          <div className="space-y-2">
            {(data.recentActivities || []).length === 0 && <p className="text-sm text-muted">Nenhuma atividade registrada ainda. Ações administrativas passarão a aparecer aqui após este update.</p>}
            {(data.recentActivities || []).map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 border-b border-line/50 py-2 text-xs last:border-0">
                <div><div className="text-slate-200"><span className="text-electric-light font-mono">{a.action}</span> {a.entityType} {a.entityLabel ? `- ${a.entityLabel}` : ''}</div><div className="text-muted">{a.actorEmail || 'sistema'}</div></div>
                <div className="text-muted shrink-0">{formatDate(a.createdAt)}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="surface p-5">
        <h2 className="font-semibold text-[#D7EBDD] mb-4 flex items-center gap-2"><Database size={16} className="text-electric-light" /> System Health</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
          <div className="rounded-xl border border-line bg-carbon/40 p-3"><div className="text-muted text-xs">API</div><div className={systemHealth.api === 'ok' ? 'text-emerald-300 font-semibold' : 'text-red-300 font-semibold'}>{systemHealth.api}</div></div>
          <div className="rounded-xl border border-line bg-carbon/40 p-3"><div className="text-muted text-xs">Banco de dados</div><div className={systemHealth.database === 'ok' ? 'text-emerald-300 font-semibold' : 'text-red-300 font-semibold'}>{systemHealth.database}</div></div>
          <div className="rounded-xl border border-line bg-carbon/40 p-3"><div className="text-muted text-xs">Produtos carregados</div><div className="text-[#D7EBDD] font-semibold">{systemHealth.productsLoaded}</div></div>
          <div className="rounded-xl border border-line bg-carbon/40 p-3"><div className="text-muted text-xs">Mídia / erros recentes</div><div className="text-[#D7EBDD] font-semibold">{systemHealth.media.totalImages} imgs / {systemHealth.recentErrorsCollected ? systemHealth.recentErrors : 'não coletado'}</div></div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
