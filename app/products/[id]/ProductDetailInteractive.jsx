'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/components/CartContext';

export default function ProductDetailInteractive({ product }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?._id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = product.variants.find((v) => v._id === selectedVariantId) || product.variants[0];
  const outOfStock = variant && variant.stock !== undefined && variant.stock <= 0;
  const images = product.images && product.images.length > 0 ? product.images : [];

  const handleAddToCart = () => {
    if (!variant) return;
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

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  return (
    <>
      {/* Image gallery */}
      <div className="mb-10 lg:mb-0">
        <div className="aspect-square bg-subtle rounded-2xl overflow-hidden border border-border relative flex items-center justify-center">
          {images.length > 0 ? (
            <Image
              src={images[activeImage]}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <span className="text-muted">No Image Available</span>
          )}
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-3 mt-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`aspect-square bg-subtle rounded-lg overflow-hidden border-2 relative transition-colors ${
                  idx === activeImage ? 'border-primary' : 'border-border hover:border-primary/50'
                }`}
              >
                <Image src={img} alt="" fill sizes="120px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col">
        {product.category && (
          <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{product.category}</span>
        )}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">{product.name}</h1>

        <div className="text-3xl font-bold text-foreground mb-6">
          ${variant ? variant.price.toFixed(2) : '0.00'}
        </div>

        <div 
          className="text-muted mb-6 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />

        {product.variants && product.variants.length > 1 && (
          <div className="mb-8 border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Available Options</h3>
            <div className="grid grid-cols-2 gap-3">
              {product.variants.map((v) => (
                <button
                  key={v._id}
                  onClick={() => setSelectedVariantId(v._id)}
                  className={`text-left border-2 rounded-xl p-3 transition-colors ${
                    v._id === selectedVariantId ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  } ${v.stock <= 0 ? 'opacity-50' : ''}`}
                >
                  <div className="font-medium text-foreground text-sm">{v.label}</div>
                  <div className="text-muted text-xs mt-0.5">
                    ${v.price.toFixed(2)} {v.stock <= 0 && <span className="text-danger">&middot; Out of stock</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8 flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">Quantity</span>
          <div className="flex items-center border border-border rounded-lg">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-3 py-2 text-muted hover:text-primary">-</button>
            <span className="px-4 text-foreground">{quantity}</span>
            <button onClick={() => setQuantity((q) => q + 1)} className="px-3 py-2 text-muted hover:text-primary">+</button>
          </div>
          {variant && variant.stock > 0 && variant.stock < 10 && (
            <span className="text-warning text-sm font-medium">Only {variant.stock} left</span>
          )}
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex-1 bg-white border-2 border-primary text-primary hover:bg-primary/5 text-center py-3.5 px-6 rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            {outOfStock ? 'Out of Stock' : added ? 'Added ✓' : 'Add to Cart'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={outOfStock}
            className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground text-center py-3.5 px-6 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            Buy Now
          </button>
        </div>

        <div className="bg-subtle border border-border rounded-xl p-5 flex flex-col gap-3 text-sm text-muted">
          <div className="flex items-center gap-3">
             <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
             Fast Global Shipping
          </div>
          <div className="flex items-center gap-3">
             <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
             Secure 3D-Secure Payments
          </div>
        </div>
      </div>
    </>
  );
}
