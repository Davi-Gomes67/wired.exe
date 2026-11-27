import { Heart } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';

export default function WishlistPage() {
  const { items } = useWishlist();
  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-7"><p className="eyebrow">// wishlist</p><h1 className="section-title mt-3">Favoritos</h1><p className="section-desc">Produtos salvos neste dispositivo.</p></div>
      {items.length === 0 ?<EmptyState icon={Heart} title="Nenhum favorito ainda" description="Salve produtos para acompanhar depois." actionTo="/catalogo" actionLabel="Explorar catálogo" /> : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">{items.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      )}
    </div>
  );
}
