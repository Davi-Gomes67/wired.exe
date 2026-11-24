import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, Check, Package, ShoppingCart } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import Price from '../components/Price';
import ProductGallery from '../components/ProductGallery';
import ProductGrid from '../components/ProductGrid';
import QuantityStepper from '../components/QuantityStepper';
import { useCart } from '../context/CartContext';
import { catalogService, getErrorMessage } from '../services/api';

function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setProduct(null);
    setQuantity(1);

    catalogService
      .getProductBySlug(slug, controller.signal)
      .then((response) => setProduct(response.data))
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') {
          setError(requestError.response?.status === 404 ? 'Produto não encontrado.' : getErrorMessage(requestError));
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [slug]);

  useEffect(() => {
    if (!product?.category?.slug) return undefined;
    const controller = new AbortController();
    catalogService
      .getProducts({ category: product.category.slug, pageSize: 5 }, controller.signal)
      .then((response) => setRelated((response.data || []).filter((item) => item.id !== product.id).slice(0, 4)))
      .catch(() => setRelated([]));
    return () => controller.abort();
  }, [product]);

  useEffect(() => {
    if (!added) return undefined;
    const timer = window.setTimeout(() => setAdded(false), 2200);
    return () => window.clearTimeout(timer);
  }, [added]);

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-4 w-1/4" />
            <div className="skeleton h-9 w-3/4" />
            <div className="skeleton h-16 w-full" />
            <div className="skeleton h-10 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={AlertCircle}
          title={error || 'Produto indisponível'}
          description="O item pode ter sido removido ou o endereço está incorreto."
          actionTo="/catalogo"
          actionLabel="Voltar ao catálogo"
        />
      </div>
    );
  }

  const outOfStock = product.stock === 0;
  const priceOnRequest = !product.priceCents || product.priceCents <= 0;
  const galleryImages = product.images?.length
    ? product.images
    : (product.imageUrl ? [{ url: product.imageUrl, alt: product.name }] : []);

  const handleAdd = (goToCheckout = false) => {
    addItem(product, quantity);
    if (goToCheckout) navigate('/checkout');
    else setAdded(true);
  };

  return (
    <div className="container-page py-8 sm:py-12">
      <Link to="/catalogo" className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-[#D7EBDD]">
        <ArrowLeft size={16} /> Voltar ao catálogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={galleryImages} productName={product.name} />

        <div className="flex flex-col">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-electric-light">
            {product.brand ? `${product.brand} / ${product.category?.name || 'WIRED.exe'}` : (product.category?.name || 'WIRED.exe')}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-[#D7EBDD] sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-muted sm:text-base">{product.description}</p>

          <div className="mt-7 flex flex-wrap items-end gap-4">
            <div>
              {priceOnRequest ? (
                <p className="font-mono text-xl font-semibold text-electric-light">Sob consulta</p>
              ) : (
                <>
                  {product.compareAtCents > product.priceCents && (
                    <p className="font-mono text-sm text-muted line-through">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.compareAtCents / 100)}</p>
                  )}
                  <Price cents={product.priceCents} size="xl" className="text-[#D7EBDD]" />
                </>
              )}
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${outOfStock ? 'bg-red-500/15 text-red-300' : 'bg-electric/10 text-electric-light'}`}>
              {outOfStock ? 'Esgotado' : `${product.stock} unidades em estoque`}
            </span>
          </div>

          {!outOfStock && (
            <div className="mt-7 flex flex-col gap-3 border-t border-line pt-7">
              <label className="text-sm font-medium text-[#D7EBDD]/90">Quantidade</label>
              <div>
                <QuantityStepper value={quantity} max={product.stock} onChange={setQuantity} />
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => handleAdd(false)} disabled={outOfStock || priceOnRequest} className="btn-primary flex-1">
              {added ? <Check size={18} /> : <ShoppingCart size={18} />}
              {priceOnRequest ? 'Sob consulta' : added ? 'Adicionado ao carrinho' : 'Adicionar ao carrinho'}
            </button>
            <button type="button" onClick={() => handleAdd(true)} disabled={outOfStock || priceOnRequest} className="btn-ghost flex-1">
              Comprar agora
            </button>
          </div>

          <div className="mt-8 grid gap-3 rounded-2xl border border-line bg-carbon/60 p-5 text-sm text-muted">
            <p className="flex items-start gap-2.5">
              <Package size={16} className="mt-0.5 shrink-0 text-electric-light" />
              Pedido registrado no sistema com status pendente — sem cobrança online real.
            </p>
            <p className="flex items-start gap-2.5">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-electric" />
              The internet is part of reality. Catálogo tecnológico e espaço de cultura geek WIRED.exe.
            </p>
          </div>
        </div>
      </div>

      {product.specifications?.length > 0 && (
        <section className="mt-12 sm:mt-16">
          <p className="eyebrow">// especificações</p>
          <h2 className="section-title mt-3">Detalhes técnicos</h2>
          <div className="surface mt-6 overflow-hidden">
            <dl className="divide-y divide-line">
              {product.specifications.map((spec) => (
                <div key={spec.id || spec.label} className="grid gap-1 px-4 py-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-muted">{spec.label}</dt>
                  <dd className="text-sm text-[#D7EBDD]">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <p className="eyebrow">// relacionados</p>
          <h2 className="section-title mt-3">Quem viu, viu também</h2>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductPage;
