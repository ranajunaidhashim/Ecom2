'use client';
import { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import Image from 'next/image';

export default function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, setIsCartDrawerOpen } = useCart();
  
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');

  // Reset state when product changes
  useEffect(() => {
    if (quickViewProduct) {
      const firstVariant = quickViewProduct.variants?.[0]?._id || '';
      setSelectedVariantId(firstVariant);
      setQuantity(1);
      setActiveImage(quickViewProduct.images?.[0] || '');
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const selectedVariant = quickViewProduct.variants?.find(v => v._id === selectedVariantId) || quickViewProduct.variants?.[0];
  const price = selectedVariant ? selectedVariant.price : 0;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    
    addToCart({
      productId: quickViewProduct._id,
      variantId: selectedVariant._id,
      name: quickViewProduct.name,
      variantName: selectedVariant.name,
      price: selectedVariant.price,
      quantity,
      image: quickViewProduct.images?.[0] || null,
      shippingCost: quickViewProduct.shippingCost || 0
    });
    
    setQuickViewProduct(null);
    setIsCartDrawerOpen(true);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
        onClick={() => setQuickViewProduct(null)}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-background w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative pointer-events-auto shadow-2xl rounded-sm">
          {/* Close Button */}
          <button 
            onClick={() => setQuickViewProduct(null)} 
            className="absolute top-4 right-4 z-10 p-2 bg-background/80 hover:bg-background rounded-full text-foreground hover:opacity-70 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Left: Images */}
          <div className="w-full md:w-1/3 bg-surface p-4 flex flex-col gap-4 overflow-y-auto max-h-[40vh] md:max-h-full border-b md:border-b-0 md:border-r border-border/10">
            <div className="relative aspect-square w-full bg-white mb-2">
              {activeImage ? (
                <Image src={activeImage} alt={quickViewProduct.name} fill className="object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
              )}
            </div>
            
            {quickViewProduct.images && quickViewProduct.images.length > 1 && (
              <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
                {quickViewProduct.images.map((img, i) => (
                  <button 
                    key={i} 
                    className={`relative w-20 h-20 flex-shrink-0 border-2 ${activeImage === img ? 'border-foreground' : 'border-transparent'}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="w-full md:w-2/3 p-6 md:p-8 flex flex-col overflow-y-auto max-h-[50vh] md:max-h-full">
            <h2 className="text-2xl font-bold text-foreground uppercase tracking-wide mb-2">{quickViewProduct.name}</h2>
            <div className="text-xl font-bold text-foreground mb-6">
              ${price.toFixed(2)}
            </div>
            
            {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground uppercase tracking-widest mb-2">Variant / Size</label>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.variants.map(v => (
                    <button
                      key={v._id}
                      onClick={() => setSelectedVariantId(v._id)}
                      className={`px-4 py-2 border text-sm font-medium uppercase tracking-wide ${
                        selectedVariantId === v._id 
                          ? 'border-foreground bg-foreground text-background' 
                          : 'border-foreground/20 text-foreground hover:border-foreground'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground uppercase tracking-widest mb-2">Quantity</label>
              <div className="flex items-center border border-foreground/20 w-max">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="px-4 py-2 hover:bg-foreground/5"
                >-</button>
                <span className="px-4 font-medium min-w-[3rem] text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="px-4 py-2 hover:bg-foreground/5"
                >+</button>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-border/10">
              <button 
                onClick={handleAddToCart}
                disabled={!selectedVariant}
                className="w-full bg-foreground text-background font-bold text-sm uppercase tracking-wider py-4 hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
