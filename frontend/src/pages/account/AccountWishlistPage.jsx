import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import EmptyState from '../../components/EmptyState';
import ProductCard from '../../components/ProductCard';
import { accountService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';

export default function AccountWishlistPage() {
  const { isAuthenticated } = useAuth();
  const { items: localItems } = useWishlist();
  const [items, setItems] = useState(localItems);
  useEffect(() => {
    let active = true;
    if (!isAuthenticated) { setItems(localItems); return undefined; }
    accountService.wishlist().then((r) => { if (active) setItems(r.data || []); }).catch(() => { if (active) setItems(localItems); });
    return () => { active = false; };
  }, [isAuthenticated, localItems]);
  return (
    <div>
      <p className="eyebrow">// wishlist</p><h1 className="section-title mt-3">Wishlist</h1><p className="section-desc">Produtos salvos na sua conta.</p>
      <div className="mt-6">{items.length === 0 ?<EmptyState icon={Heart} title="Nenhum favorito ainda" description="Salve produtos para acompanhar depois." actionTo="/catalogo" actionLabel="Explorar catálogo" /> : <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>}</div>
    </div>
  );
}
