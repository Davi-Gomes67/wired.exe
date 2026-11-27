import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import ProductCard from '../../components/ProductCard';
import { accountService } from '../../services/api';
import { getRecentlyViewed } from '../../utils/recently-viewed';
import { useAuth } from '../../context/AuthContext';

export default function AccountRecentlyViewedPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(getRecentlyViewed());
  useEffect(() => {
    let active = true;
    if (!isAuthenticated) { setItems(getRecentlyViewed()); return undefined; }
    accountService.recentlyViewed().then((r) => { if (active) setItems(r.data || []); }).catch(() => { if (active) setItems(getRecentlyViewed()); });
    return () => { active = false; };
  }, [isAuthenticated]);
  return (
    <div>
      <p className="eyebrow">// recently viewed</p><h1 className="section-title mt-3">Recently Viewed</h1><p className="section-desc">Produtos vistos recentemente.</p>
      <div className="mt-6">{items.length === 0 ?<EmptyState icon={Clock3} title="Nada por aqui" description="Produtos que você abrir aparecerão aqui." actionTo="/catalogo" actionLabel="Explorar catálogo" /> : <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">{items.map((p) => <ProductCard key={p.id || p.slug} product={p} />)}</div>}</div>
    </div>
  );
}
