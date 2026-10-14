'use client';

import { useEffect } from 'react';
import { useCart } from '@/components/CartContext';

export default function ClearCartOnMount() {
  const { clearCart, setAppliedDiscount } = useCart();

  useEffect(() => {
    clearCart();
    setAppliedDiscount(null);
  }, [clearCart, setAppliedDiscount]);

  return null;
}
