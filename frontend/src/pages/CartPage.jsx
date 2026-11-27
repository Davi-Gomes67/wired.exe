import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, RefreshCw, ShieldCheck, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import Price from '../components/Price';
import QuantityStepper from '../components/QuantityStepper';
import { useCart } from '../context/CartContext';
import { cartService, getErrorMessage, rootAccessService } from '../services/api';
import { formatPrice } from '../utils/format';

function CartPage() {
  const { items, totalCents, setQuantity, removeItem } = useCart();
  const [validation, setValidation] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [rootOffer, setRootOffer] = useState(null);

  useEffect(() => {
    let active = true;
    rootAccessService.getPublic().then((res) => { if (active) setRootOffer(res.data); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const runValidation = async () => {
    setValidating(true);
    setValidationError('');
    try {
      const response = await cartService.validate(items.map((item) => ({ productId: item.id, quantity: item.quantity })));
      setValidation(response.data);
    } catch (error) {
      setValidationError(getErrorMessage(error));
    } finally {
      setValidating(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={ShoppingCart}
          title="Seu carrinho está vazio"
          description="Explore o catálogo e adicione produtos para montar seu pedido."
          actionTo="/catalogo"
          actionLabel="Explorar catálogo"
        />
      </div>
    );
  }

  const hasIssues = validation && !validation.valid;
  const showRoot = rootOffer?.enabled && rootOffer?.offerCart;

  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow">// carrinho</p>
      <h1 className="section-title mt-3">Seus itens</h1>
      <p className="section-desc">Revise quantidades e valide o estoque antes do checkout.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {items.map((item) => {
            const line = validation?.items?.find((v) => v.productId === item.id);
            const conflict = line && !line.valid;
            return (
              <article key={item.id} className={`surface flex gap-4 p-3 sm:p-4 ${conflict ?'border-amber-500/40' : ''}`}>
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-carbon sm:h-24 sm:w-24">
                  <div className="absolute inset-0 bg-grid opacity-40 [background-size:14px_14px]" />
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} className="relative h-full w-full object-contain p-2" />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/produto/${item.slug}`} className="line-clamp-2 text-sm font-semibold text-base hover:text-electric-light">
                        {item.name}
                      </Link>
                      <p className="mt-1 font-mono text-xs text-muted">{formatPrice(item.priceCents)} / un.</p>
                      {conflict && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-300">
                          <AlertTriangle size={13} /> Estoque disponível: {line.stock}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { removeItem(item.id); setValidation(null); }}
                      aria-label={`Remover ${item.name}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <QuantityStepper
                      value={item.quantity}
                      max={Math.max(item.stock, line?.stock || 1)}
                      compact
                      onChange={(value) => { setQuantity(item.id, value); setValidation(null); }}
                    />
                    <Price cents={item.priceCents * item.quantity} className="text-base" />
                  </div>
                </div>
              </article>
            );
          })}

          {showRoot && (
            <section className="surface relative overflow-hidden border-electric/25 p-5 sm:p-6">
              <div className="absolute inset-0 bg-grid opacity-15 [background-size:22px_22px]" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <p className="eyebrow">// UNLOCK ROOT ACCESS</p>
                  <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-base sm:text-2xl">Your purchase is just the beginning.</h2>
                  <p className="mt-2 text-sm text-muted">Become a WIRED.exe member and unlock exclusive benefits.</p>
                  <div className="mt-4 grid gap-2 text-sm text-sub sm:grid-cols-2">
                    <p className="flex items-center gap-2"><ShieldCheck size={14} className="text-electric-light" /> ROOT ACCESS — {formatPrice(rootOffer.priceCents || 4990)}/mês</p>
                    <p className="flex items-center gap-2"><ShieldCheck size={14} className="text-electric-light" /> Frete grátis em compras elegíveis</p>
                    <p className="flex items-center gap-2"><ShieldCheck size={14} className="text-electric-light" /> Mystery Box mensal</p>
                    <p className="flex items-center gap-2"><ShieldCheck size={14} className="text-electric-light" /> Itens exclusivos e acesso antecipado</p>
                  </div>
                  <p className="mt-4 text-xs text-muted">Assinatura opcional, válida enquanto ativa. Sem cobrança automática sem integração configurada.</p>
                </div>
                <Link to="/root-access" className="btn-primary shrink-0 sm:w-auto">QUERO SER ROOT MEMBER</Link>
              </div>
            </section>
          )}
        </div>

        <aside className="surface h-fit p-5 lg:sticky lg:top-28">
          <h2 className="text-lg font-semibold text-base">Resumo</h2>
          <div className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <Price cents={validation?.subtotalCents ?? totalCents} className="text-sub" />
            </div>
            <div className="flex justify-between text-muted">
              <span>Frete</span>
              <span className="text-muted">Calculado na entrega</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Pagamento</span>
              <span className="text-cyber-light">Simulação (sem cobrança)</span>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
            <span className="text-sm font-medium text-sub">Total</span>
            <Price cents={validation?.totalCents ?? totalCents} size="lg" className="text-base" />
          </div>

          {validationError && <p className="mt-4 text-xs text-red-300">{validationError}</p>}
          {validation && !hasIssues && (
            <p className="mt-4 flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 size={14} /> Estoque validado no backend.
            </p>
          )}
          {hasIssues && (
            <p className="mt-4 flex items-center gap-2 text-xs text-amber-300">
              <AlertTriangle size={14} /> Ajuste os itens com conflito antes de continuar.
            </p>
          )}

          <button type="button" onClick={runValidation} disabled={validating} className="btn-ghost mt-5 w-full">
            {validating ?<Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {validating ?'Validando...' : 'Validar estoque'}
          </button>

          <Link
            to={hasIssues ?'#' : '/checkout'}
            onClick={(e) => { if (hasIssues) e.preventDefault(); }}
            className={`btn-primary mt-3 w-full ${hasIssues ?'pointer-events-none opacity-45' : ''}`}
            aria-disabled={hasIssues}
          >
            Ir para o checkout <ArrowRight size={17} />
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default CartPage;

