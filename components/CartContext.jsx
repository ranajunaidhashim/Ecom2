'use client';

import { createContext, useContext, useEffect, useState } from 'react';

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

  const addToCart = (item) => {
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
  };

  const removeFromCart = (productId, variantId) => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.variantId === variantId)));
  };

  const updateQuantity = (productId, variantId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId, variantId);
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartShippingCost = cart.reduce((sum, i) => sum + (i.shippingCost || 0) * i.quantity, 0);

  let dynamicDiscountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percentage') {
      dynamicDiscountAmount = (subtotal * appliedDiscount.value) / 100;
    } else if (appliedDiscount.type === 'fixed') {
      dynamicDiscountAmount = appliedDiscount.value;
    }
    if (dynamicDiscountAmount > subtotal) {
      dynamicDiscountAmount = subtotal;
    }
  }

  const computedAppliedDiscount = appliedDiscount 
    ? { ...appliedDiscount, amount: dynamicDiscountAmount } 
    : null;

  return (
    <CartContext.Provider
      value={{ 
        cart, hydrated, addToCart, removeFromCart, updateQuantity, clearCart, 
        totalItems, subtotal, cartShippingCost,
        appliedDiscount: computedAppliedDiscount, setAppliedDiscount,
        isCartDrawerOpen, setIsCartDrawerOpen,
        quickViewProduct, setQuickViewProduct
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
