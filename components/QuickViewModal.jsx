'use client';
import { useState, useEffect, useRef } from 'react';
import { useCart } from './CartContext';
import Image from 'next/image';
import Link from 'next/link';

export default function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, setIsCartDrawerOpen } = useCart();
  
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const scrollGalleryRef = useRef(null);

  // Reset state when product changes
  useEffect(() => {
    if (quickViewProduct) {
      const firstVariant = quickViewProduct.variants?.[0]?._id || '';
      setSelectedVariantId(firstVariant);
      setQuantity(1);
      setAdded(false);
      setActiveMobileIndex(0);
      if (scrollGalleryRef.current) {
        scrollGalleryRef.current.scrollLeft = 0;
      }
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const images = quickViewProduct.images && quickViewProduct.images.length > 0 
    ? quickViewProduct.images 
    : [];

  const selectedVariant = quickViewProduct.variants?.find(v => v._id === selectedVariantId) || quickViewProduct.variants?.[0];
  const price = selectedVariant ? Number(selectedVariant.price || 0) : 0;
  const isOutOfStock = selectedVariant && selectedVariant.stock !== undefined && selectedVariant.stock <= 0;

  // Clean short excerpt without full HTML description
  const rawText = (quickViewProduct.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const shortExcerpt = rawText.length > 150 ? rawText.slice(0, 150) + '...' : rawText;

  const handleGalleryScroll = (e) => {
    const el = e.currentTarget;
    if (el && el.clientWidth > 0) {
      const newIndex = Math.round(el.scrollLeft / el.clientWidth);
      if (newIndex !== activeMobileIndex && newIndex >= 0 && newIndex < images.length) {
        setActiveMobileIndex(newIndex);
      }
    }
  };

  const handleSelectVariant = (variant) => {
    setSelectedVariantId(variant._id);
    if (variant.imageUrl) {
      const idx = images.findIndex((img) => img === variant.imageUrl);
      if (idx !== -1) {
        const el = document.getElementById(`quickview-img-${idx}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        setActiveMobileIndex(idx);
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;
    
    addToCart({
      productId: quickViewProduct._id,
      variantId: selectedVariant._id,
      name: quickViewProduct.name,
      variantName: selectedVariant.label || selectedVariant.name || 'Default',
      label: selectedVariant.label || selectedVariant.name || 'Default',
      price: selectedVariant.price,
      quantity,
      image: selectedVariant.imageUrl || images[0] || null,
      shippingCost: quickViewProduct.shippingCost || 0
    });
    
    setAdded(true);
    setTimeout(() => {
      setQuickViewProduct(null);
      setIsCartDrawerOpen(true);
    }, 400);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setQuickViewProduct(null)}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-[201] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div className="bg-background w-full sm:max-w-4xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto md:overflow-hidden flex flex-col md:flex-row relative pointer-events-auto shadow-2xl rounded-t-[28px] sm:rounded-2xl border border-border/30 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
          
          {/* Mobile Drag / Sheet Pill */}
          <div className="w-10 h-1 bg-foreground/20 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

          {/* Close Button */}
          <button 
            onClick={() => setQuickViewProduct(null)} 
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 sm:p-2.5 bg-surface/90 hover:bg-elevated rounded-full text-foreground/80 hover:text-foreground transition-all shadow-md backdrop-blur-sm touch-manipulation"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Left: Images Gallery (Swipeable snap on mobile, vertical stack on desktop) */}
          <div className="w-full md:w-1/2 bg-surface p-3 sm:p-5 md:p-6 border-b md:border-b-0 md:border-r border-border/20 flex-shrink-0 md:overflow-y-auto md:max-h-[85vh]">
            <div 
              ref={scrollGalleryRef}
              onScroll={handleGalleryScroll}
              className="flex flex-row md:flex-col gap-3 sm:gap-4 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {images.length > 0 ? (
                images.map((img, idx) => (
                  <div 
                    key={idx} 
                    id={`quickview-img-${idx}`}
                    className="relative aspect-square w-full min-w-full sm:min-w-[340px] md:min-w-0 bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-border/20 shadow-sm flex-shrink-0 snap-center"
                  >
                    <Image 
                      src={img} 
                      alt={`${quickViewProduct.name} - view ${idx + 1}`} 
                      fill 
                      priority={idx === 0}
                      sizes="(min-width: 768px) 450px, 100vw"
                      className="object-contain p-2 sm:p-3" 
                    />
                    {idx === 0 && quickViewProduct.category && (
                      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 bg-foreground text-background rounded shadow-sm">
                          {quickViewProduct.category}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="relative aspect-square w-full bg-white rounded-xl sm:rounded-2xl flex items-center justify-center text-muted text-xs sm:text-sm border border-border/20">
                  No Image Available
                </div>
              )}
            </div>

            {/* Mobile Carousel Dots Indicator */}
            {images.length > 1 && (
              <div className="flex md:hidden items-center justify-center gap-1.5 pt-2.5">
                {images.map((_, dotIdx) => (
                  <div 
                    key={dotIdx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeMobileIndex === dotIdx ? 'w-5 bg-foreground' : 'w-1.5 bg-foreground/20'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col md:overflow-y-auto md:max-h-[85vh]">
            
            {/* Top Badges: Category & Stock Status */}
            <div className="flex items-center justify-between gap-2 mb-2 pr-8 sm:pr-0">
              <span className="text-[11px] sm:text-xs font-semibold text-muted uppercase tracking-wider truncate">
                {quickViewProduct.category ? `Category: ${quickViewProduct.category}` : 'Featured Item'}
              </span>

              {isOutOfStock ? (
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-danger bg-danger/10 px-2 py-0.5 rounded-full flex-shrink-0">
                  Out of Stock
                </span>
              ) : selectedVariant?.stock > 0 && selectedVariant.stock <= 5 ? (
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                  Only {selectedVariant.stock} Left
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  In Stock
                </span>
              )}
            </div>

            {/* Product Title */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground uppercase tracking-wide leading-tight mb-2">
              {quickViewProduct.name}
            </h2>

            {/* Price (No SKU Code) */}
            <div className="flex items-baseline gap-3 mb-3 sm:mb-4">
              <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground">
                ${price.toFixed(2)}
              </div>
            </div>

            {/* Concise Excerpt */}
            {shortExcerpt && (
              <p className="text-xs sm:text-sm text-muted leading-relaxed mb-4 sm:mb-6 line-clamp-2 sm:line-clamp-3">
                {shortExcerpt}
              </p>
            )}

            {/* Variants / Size Options */}
            {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] sm:text-xs font-bold text-foreground uppercase tracking-wider">
                    Select Option
                  </label>
                  {selectedVariant && (
                    <span className="text-[11px] sm:text-xs text-muted truncate max-w-[160px]">
                      Selected: <strong className="text-foreground">{selectedVariant.label || selectedVariant.name || 'Default'}</strong>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {quickViewProduct.variants.map((v) => {
                    const isSelected = selectedVariantId === v._id;
                    const vLabel = v.label || v.name || 'Default';
                    const vOutOfStock = v.stock !== undefined && v.stock <= 0;

                    return (
                      <button
                        key={v._id}
                        onClick={() => handleSelectVariant(v)}
                        disabled={vOutOfStock}
                        className={`px-3 py-2 sm:px-3.5 sm:py-2.5 border rounded-lg sm:rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 sm:gap-2 touch-manipulation ${
                          isSelected 
                            ? 'border-foreground bg-foreground text-background shadow-sm' 
                            : 'border-border bg-surface text-foreground hover:border-foreground/60'
                        } ${vOutOfStock ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                      >
                        <span>{vLabel}</span>
                        {v.price && v.price !== price && (
                          <span className={`text-[10px] ${isSelected ? 'text-background/80' : 'text-muted'}`}>
                            (${Number(v.price).toFixed(2)})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-[11px] sm:text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                Quantity
              </label>
              <div className="flex items-center border border-border bg-surface rounded-lg sm:rounded-xl w-max overflow-hidden">
                <button 
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="w-9 h-9 sm:w-10 sm:h-10 text-foreground hover:bg-elevated transition-colors font-bold text-sm sm:text-base flex items-center justify-center touch-manipulation"
                  aria-label="Decrease quantity"
                >
                  &minus;
                </button>
                <span className="px-3 sm:px-4 font-semibold text-xs sm:text-sm min-w-[2.2rem] text-center text-foreground">
                  {quantity}
                </span>
                <button 
                  type="button"
                  onClick={() => setQuantity(quantity + 1)} 
                  className="w-9 h-9 sm:w-10 sm:h-10 text-foreground hover:bg-elevated transition-colors font-bold text-sm sm:text-base flex items-center justify-center touch-manipulation"
                  aria-label="Increase quantity"
                >
                  &#43;
                </button>
              </div>
            </div>

            {/* Service & Quality Badges (No shipping charges shown) */}
            <div className="grid grid-cols-2 gap-2 p-2.5 sm:p-3 bg-surface rounded-xl border border-border/20 text-[11px] sm:text-xs text-muted mb-4 sm:mb-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Quality Guaranteed</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure Checkout</span>
              </div>
            </div>

            {/* Actions: Sticky footer on mobile */}
            <div className="mt-auto pt-3 sm:pt-4 border-t border-border/20 flex flex-col gap-2.5 sticky bottom-0 bg-background/95 backdrop-blur-sm pb-2 sm:pb-0 z-10">
              <button 
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedVariant || isOutOfStock}
                className="w-full bg-foreground text-background font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 sm:py-4 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md touch-manipulation"
              >
                {added ? 'Added to Cart ✓' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <div className="text-center">
                <Link
                  href={`/products/${quickViewProduct._id}`}
                  onClick={() => setQuickViewProduct(null)}
                  className="text-[11px] sm:text-xs text-muted hover:text-foreground font-semibold uppercase tracking-wider underline underline-offset-4 transition-colors inline-block py-1"
                >
                  View Full Product Details &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
