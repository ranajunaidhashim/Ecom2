'use client';
import { useState, useEffect, useRef } from 'react';
import { useCart } from './CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function QuickViewModal() {
  const pathname = usePathname();
  const { quickViewProduct, setQuickViewProduct, addToCart, setIsCartDrawerOpen } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const scrollGalleryRef = useRef(null);

  // Reset state and attach modal listeners when product changes
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

      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Close on Escape
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setQuickViewProduct(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [quickViewProduct, setQuickViewProduct]);

  if (!quickViewProduct || pathname?.startsWith('/admin')) return null;

  const images = quickViewProduct.images && quickViewProduct.images.length > 0
    ? quickViewProduct.images
    : [];

  // Guarantee at least one valid fallback variant so adding to cart always works
  const variants = (quickViewProduct.variants && quickViewProduct.variants.length > 0)
    ? quickViewProduct.variants
    : [{
        _id: 'default',
        label: 'Standard',
        name: 'Standard',
        price: quickViewProduct.price || 0,
        stock: 99
      }];

  const selectedVariant = variants.find(v => v._id === selectedVariantId) || variants[0];
  const price = Number(selectedVariant?.price ?? quickViewProduct.price ?? 0);
  const isOutOfStock = selectedVariant && selectedVariant.stock !== undefined && selectedVariant.stock <= 0;

  // Clean short excerpt without full HTML description
  const rawText = (quickViewProduct.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const shortExcerpt = rawText.length > 130 ? rawText.slice(0, 130) + '...' : rawText;

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
      variantName: selectedVariant.label || selectedVariant.name || 'Standard',
      label: selectedVariant.label || selectedVariant.name || 'Standard',
      price,
      quantity,
      image: selectedVariant.imageUrl || images[0] || null,
      shippingCost: quickViewProduct.shippingCost || 0
    });

    setAdded(true);
    setTimeout(() => {
      setQuickViewProduct(null);
      setIsCartDrawerOpen(true);
    }, 350);
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
        <div className="bg-white text-zinc-900 w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[88vh] overflow-y-auto md:overflow-hidden flex flex-col md:flex-row relative pointer-events-auto shadow-2xl rounded-t-[24px] sm:rounded-2xl border border-zinc-200 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">

          {/* Mobile Drag Pill */}
          <div className="w-10 h-1 bg-zinc-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

          {/* Close Button */}
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 sm:p-2.5 bg-zinc-100 hover:bg-zinc-200 rounded-full text-zinc-600 hover:text-black transition-all shadow-sm backdrop-blur-sm touch-manipulation"
            aria-label="Close modal"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Left: Images Gallery (Compact on mobile, full on desktop) */}
          <div className="w-full md:w-1/2 bg-zinc-50 p-3 sm:p-5 md:p-6 border-b md:border-b-0 md:border-r border-zinc-200 flex-shrink-0 md:overflow-y-auto md:max-h-[85vh]">
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
                    className="relative h-48 sm:h-60 md:h-auto md:aspect-square w-full min-w-full md:min-w-0 bg-white rounded-xl overflow-hidden border border-zinc-200/80 shadow-sm flex-shrink-0 snap-center"
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
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-black text-white rounded shadow-sm">
                          {quickViewProduct.category}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="relative h-48 sm:h-60 md:aspect-square w-full bg-white rounded-xl flex items-center justify-center text-zinc-400 text-xs border border-zinc-200">
                  No Image Available
                </div>
              )}
            </div>

            {/* Mobile Carousel Dots Indicator */}
            {images.length > 1 && (
              <div className="flex md:hidden items-center justify-center gap-1.5 pt-2">
                {images.map((_, dotIdx) => (
                  <div
                    key={dotIdx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeMobileIndex === dotIdx ? 'w-5 bg-black' : 'w-1.5 bg-zinc-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col md:overflow-y-auto md:max-h-[85vh]">

            {/* Top Badges: Category & Ready to Ship */}
            <div className="flex items-center justify-between gap-2 mb-2 pr-8 sm:pr-0">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider truncate">
                {quickViewProduct.category ? `Category: ${quickViewProduct.category}` : 'Featured Item'}
              </span>

              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                In Stock
              </span>
            </div>

            {/* Product Title */}
            <h2 className="text-base sm:text-xl md:text-2xl font-extrabold text-zinc-900 uppercase tracking-wide leading-snug mb-2">
              {quickViewProduct.name}
            </h2>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-3">
              <div className="text-2xl sm:text-3xl font-black text-zinc-900">
                ${price.toFixed(2)}
              </div>
            </div>

            {/* Concise Excerpt */}
            {shortExcerpt && (
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-4 line-clamp-2">
                {shortExcerpt}
              </p>
            )}

            {/* Variants / Size Options (Only rendered if more than 1 option exists) */}
            {variants.length > 1 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[11px] font-bold text-zinc-800 uppercase tracking-wider">
                    Select Option
                  </label>
                  {selectedVariant && (
                    <span className="text-[11px] text-zinc-500 truncate max-w-[160px]">
                      Selected: <strong className="text-zinc-900">{selectedVariant.label || selectedVariant.name || 'Standard'}</strong>
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {variants.map((v) => {
                    const isSelected = selectedVariantId === v._id || (variants.length === 1 && !selectedVariantId);
                    const vLabel = v.label || v.name || 'Standard';
                    const vOutOfStock = v.stock !== undefined && v.stock <= 0;

                    return (
                      <button
                        key={v._id}
                        type="button"
                        onClick={() => handleSelectVariant(v)}
                        disabled={vOutOfStock}
                        className={`px-3 py-2 border rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 touch-manipulation ${
                          isSelected
                            ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                            : 'border-zinc-300 bg-white text-zinc-800 hover:border-zinc-600'
                        } ${vOutOfStock ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                      >
                        <span>{vLabel}</span>
                        {v.price && v.price !== price && (
                          <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-zinc-500'}`}>
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
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-zinc-800 uppercase tracking-wider mb-1.5">
                Quantity
              </label>
              <div className="flex items-center border border-zinc-300 bg-zinc-50 rounded-lg w-max overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 text-zinc-800 hover:bg-zinc-200 transition-colors font-bold text-base flex items-center justify-center touch-manipulation"
                  aria-label="Decrease quantity"
                >
                  &minus;
                </button>
                <span className="px-3.5 font-bold text-sm min-w-[2.2rem] text-center text-zinc-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 text-zinc-800 hover:bg-zinc-200 transition-colors font-bold text-base flex items-center justify-center touch-manipulation"
                  aria-label="Increase quantity"
                >
                  &#43;
                </button>
              </div>
            </div>

            {/* Quality & Security Note */}
            <div className="flex items-center gap-4 py-2 border-t border-zinc-150 text-[11px] text-zinc-500 mb-3">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Quality Verified
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure Checkout
              </span>
            </div>

            {/* Actions: Sticky footer on mobile */}
            <div className="mt-auto pt-2 border-t border-zinc-200 flex flex-col gap-2 sticky bottom-0 bg-white/95 backdrop-blur-sm pb-1 z-10">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-zinc-900 hover:bg-black text-white font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 sm:py-4 rounded-xl active:scale-[0.99] transition-all shadow-md touch-manipulation"
              >
                {added ? 'Added to Cart ✓' : 'Add to Cart'}
              </button>

              <div className="text-center">
                <Link
                  href={`/products/${quickViewProduct._id}`}
                  onClick={() => setQuickViewProduct(null)}
                  className="text-[11px] sm:text-xs text-zinc-500 hover:text-black font-semibold uppercase tracking-wider underline underline-offset-4 transition-colors inline-block py-1"
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
