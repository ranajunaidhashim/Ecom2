'use client';
import { useCart } from './CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function CartDrawer() {
  const { 
    cart, 
    isCartDrawerOpen, 
    setIsCartDrawerOpen, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    cartShippingCost,
    hydrated,
    appliedDiscount,
    setAppliedDiscount
  } = useCart();

  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [discountError, setDiscountError] = useState(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);

  if (!hydrated) return null;

  const handleApplyDiscount = async () => {
    if (!discountCodeInput) return;
    setValidatingDiscount(true);
    setDiscountError(null);
    try {
      const res = await fetch('/api/checkout/discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCodeInput, subtotal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid discount code');
      setAppliedDiscount({ code: data.code, type: data.type, value: data.value });
      setDiscountCodeInput('');
    } catch (err) {
      setDiscountError(err.message);
    } finally {
      setValidatingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountError(null);
  };

  const currentSubtotal = Math.max(0, subtotal - (appliedDiscount?.amount || 0));
  const total = currentSubtotal + cartShippingCost;

  return (
    <>
      {/* Backdrop */}
      {isCartDrawerOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsCartDrawerOpen(false)}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-[101] w-full sm:w-[450px] bg-background shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isCartDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <h2 className="text-xl font-bold uppercase tracking-wider">Your Cart</h2>
          <button onClick={() => setIsCartDrawerOpen(false)} className="p-2 text-foreground hover:opacity-70">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-muted mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
              <p className="text-lg font-medium text-foreground uppercase tracking-widest mb-4">Your cart is empty</p>
              <button onClick={() => setIsCartDrawerOpen(false)} className="bg-foreground text-background font-bold text-sm uppercase tracking-wider py-3 px-8 hover:opacity-80 transition-opacity">
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 border-b border-border/10 pb-4">
                <div className="relative w-20 h-24 bg-surface rounded-md overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs">No image</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <Link href={`/products/${item.productId}`} onClick={() => setIsCartDrawerOpen(false)} className="font-semibold text-sm hover:opacity-70 uppercase truncate max-w-[180px]">
                      {item.name}
                    </Link>
                    <button onClick={() => removeFromCart(item.productId, item.variantId)} className="text-muted hover:text-foreground">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-muted mt-1 uppercase tracking-wider">{item.variantName}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="flex items-center border border-foreground/20 rounded-sm">
                      <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)} className="px-2 py-1 hover:bg-foreground/10">-</button>
                      <span className="px-3 text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)} className="px-2 py-1 hover:bg-foreground/10">+</button>
                    </div>
                    <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-border/20 bg-background flex flex-col gap-3">
            <div className="flex justify-between text-sm text-muted">
              <span className="uppercase tracking-widest">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            {/* Discount Code Section */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Discount code"
                  className="flex-grow border border-border bg-surface text-foreground placeholder-muted rounded-sm px-3 py-2 outline-none focus:ring-1 focus:ring-foreground uppercase text-sm"
                  value={discountCodeInput}
                  onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                  disabled={!!appliedDiscount || validatingDiscount}
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={!discountCodeInput || !!appliedDiscount || validatingDiscount}
                  className="bg-foreground text-background px-4 py-2 rounded-sm font-semibold text-sm transition-all disabled:opacity-50 hover:bg-foreground/90 uppercase"
                >
                  {validatingDiscount ? '...' : 'Apply'}
                </button>
              </div>
              {discountError && <p className="text-red-500 text-xs font-medium">{discountError}</p>}
              
              {appliedDiscount && (
                <div className="flex justify-between items-center text-green-600 bg-green-50 p-2 rounded-sm text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Discount ({appliedDiscount.code})</span>
                    <button onClick={handleRemoveDiscount} className="text-[10px] uppercase tracking-widest hover:underline">Remove</button>
                  </div>
                  <span className="font-medium tracking-wider">-${appliedDiscount.amount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-lg font-bold mt-2">
              <span className="uppercase tracking-widest">Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <p className="text-xs text-muted mb-2 uppercase tracking-wider text-center">Shipping and taxes calculated at checkout.</p>
            
            <Link href="/checkout" onClick={() => setIsCartDrawerOpen(false)} className="w-full bg-foreground text-background font-bold text-sm uppercase tracking-wider py-4 text-center hover:opacity-80 transition-opacity flex items-center justify-center gap-2">
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
