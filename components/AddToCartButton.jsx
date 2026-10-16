'use client';

import { useState } from 'react';
import { useCart } from './CartContext';

export default function AddToCartButton({ product, variant, quantity = 1, className = '', children }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product._id,
      variantId: variant._id,
      name: product.name,
      label: variant.label,
      price: variant.price,
      shippingCost: product.shippingCost || 0,
      image: product.images?.[0] || null,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={handleClick}
      className={
        className ||
        'w-full bg-primary hover:bg-primary-dark text-primary-foreground font-medium py-3 rounded-xl transition-colors'
      }
    >
      {added ? 'Added ✓' : children || 'Add to Cart'}
    </button>
  );
}

