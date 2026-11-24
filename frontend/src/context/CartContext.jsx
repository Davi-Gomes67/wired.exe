import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const STORAGE_KEY = 'wired.exe.cart.v1';
const CartContext = createContext(null);

const normalizeItem = (product, quantity) => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  imageUrl: product.imageUrl,
  categorySlug: product.category?.slug || '',
  priceCents: product.priceCents,
  stock: product.stock,
  quantity: Math.min(Math.max(1, Number(quantity) || 1), Math.max(1, product.stock)),
});

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.items;
    case 'ADD': {
      const existing = state.find((item) => item.id === action.item.id);
      if (!existing) return [...state, action.item];
      return state.map((item) =>
        item.id === action.item.id
          ? {
              ...item,
              quantity: Math.min(item.quantity + action.item.quantity, Math.max(1, item.stock)),
            }
          : item,
      );
    }
    case 'SET_QUANTITY':
      return state.map((item) =>
        item.id === action.id
          ? {
              ...item,
              quantity: Math.min(Math.max(1, action.quantity), Math.max(1, item.stock)),
            }
          : item,
      );
    case 'REMOVE':
      return state.filter((item) => item.id !== action.id);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

function readStoredCart() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        Number.isInteger(item.id) &&
        Number.isInteger(item.priceCents) &&
        Number.isInteger(item.quantity),
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, [], readStoredCart);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      totalCents: items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
      addItem: (product, quantity = 1) => dispatch({ type: 'ADD', item: normalizeItem(product, quantity) }),
      setQuantity: (id, quantity) => dispatch({ type: 'SET_QUANTITY', id, quantity }),
      removeItem: (id) => dispatch({ type: 'REMOVE', id }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart deve ser usado dentro de CartProvider.');
  return context;
}
