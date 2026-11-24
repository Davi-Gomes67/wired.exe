import { AlertCircle, PackageSearch } from 'lucide-react';
import EmptyState from './EmptyState';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, loading, error, emptyTitle, emptyDescription }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="surface overflow-hidden">
            <div className="skeleton aspect-[4/3] rounded-none" />
            <div className="space-y-3 p-4">
              <div className="skeleton h-3 w-1/3" />
              <div className="skeleton h-4 w-5/6" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-6 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Não foi possível carregar"
        description={error}
        actionTo="/catalogo"
        actionLabel="Tentar novamente"
      />
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title={emptyTitle || 'Nenhum produto encontrado'}
        description={emptyDescription || 'Tente ajustar os filtros ou voltar mais tarde.'}
        actionTo="/catalogo"
        actionLabel="Ver catálogo completo"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
