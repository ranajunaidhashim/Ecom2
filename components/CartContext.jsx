'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'lumina_cart';

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  
  // New UI state
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setCart(JSON.parse(stored));
      const storedDiscount = window.localStorage.getItem(`${STORAGE_KEY}_discount`);
      if (storedDiscount) setAppliedDiscount(JSON.parse(storedDiscount));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (appliedDiscount) {
      window.localStorage.setItem(`${STORAGE_KEY}_discount`, JSON.stringify(appliedDiscount));
    } else {
      window.localStorage.removeItem(`${STORAGE_KEY}_discount`);
    }
  }, [appliedDiscount, hydrated]);

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      );
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId, variantId) => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));
  }, []);

  const updateQuantity = useCallback((productId, variantId, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const totalItems = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);
  const cartShippingCost = useMemo(() => cart.reduce((sum, i) => sum + (i.shippingCost || 0) * i.quantity, 0), [cart]);

  const computedAppliedDiscount = useMemo(() => {
    if (!appliedDiscount) return null;
    let dynamicDiscountAmount = 0;
    if (appliedDiscount.type === 'percentage') {
      dynamicDiscountAmount = (subtotal * appliedDiscount.value) / 100;
    } else if (appliedDiscount.type === 'fixed') {
      dynamicDiscountAmount = appliedDiscount.value;
    }
    if (dynamicDiscountAmount > subtotal) {
      dynamicDiscountAmount = subtotal;
    }
    return { ...appliedDiscount, amount: dynamicDiscountAmount };
  }, [appliedDiscount, subtotal]);

  const contextValue = useMemo(() => ({
    cart,
    hydrated,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    cartShippingCost,
    appliedDiscount: computedAppliedDiscount,
    setAppliedDiscount,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    quickViewProduct,
    setQuickViewProduct
  }), [
    cart,
    hydrated,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    cartShippingCost,
    computedAppliedDiscount,
    isCartDrawerOpen,
    quickViewProduct
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
