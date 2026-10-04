'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import Image from 'next/image';

import PayPalCheckout from '@/components/PayPalCheckout';

export default function CheckoutForm({ geoCountry }) {
  const { cart, hydrated, subtotal, cartShippingCost, appliedDiscount } = useCart();
  const router = useRouter();

  const currentTotal = Math.max(0, subtotal - (appliedDiscount?.amount || 0)) + cartShippingCost;

  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', dob: '' });
  const [address, setAddress] = useState({ line1: '', city: '', state: '', postalCode: '', country: geoCountry || 'US' });
  const [billingAddress, setBillingAddress] = useState({ line1: '', city: '', state: '', postalCode: '', country: geoCountry || 'US' });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const [validationError, setValidationError] = useState('');
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
    setIsProcessingWhop(true);
    setValidationError('');

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
      setValidationError('Please enter a valid CVV.');
      setIsProcessingWhop(false);
      return;
    }

    try {
      const res = await fetch('/api/whop/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customer,
          shippingAddress: address,
          billingAddress: sameAsShipping ? address : billingAddress,
          cardName,
          cardNumber: cleanCard,
          expiryDate,
          cvv,
          discountCode: appliedDiscount?.code,
        }),
      });
      const data = await res.json();
      
      // We do not redirect to data.redirectUrl based on user instructions.
      // We go directly to success assuming the API handled it.
      if (!res.ok) {
        throw new Error(data.error || 'Could not process payment');
      }
      
      router.push(`/checkout/success${data.orderId ? `?orderId=${data.orderId}` : ''}`);
    } catch (err) {
      setValidationError(err.message);
      setIsProcessingWhop(false);
    }
  };

  if (hydrated && cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <Link href="/products" className="text-foreground hover:underline font-bold uppercase">Browse products</Link>
        </div>
      </div>
    );
  }

  const inputClass = "w-full border border-border bg-surface text-foreground placeholder-muted p-3 outline-none focus:border-foreground text-sm";

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

          {/* RIGHT: Payment Details / Form */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-6 uppercase tracking-wider">Payment & Shipping</h2>
            <form onSubmit={handleContinue} className="bg-surface border border-border/20 p-6 shadow-sm flex flex-col">
              
              <div className="mb-6 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Contact Info</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input required placeholder="Full Name" className={inputClass} value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
                  <input required type="email" placeholder="Email" className={inputClass} value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
                </div>
                <input required type="tel" placeholder="Phone Number" className={inputClass} value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
              </div>

              <div className="mb-8 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Shipping Address</h3>
                <input required placeholder="Street Address" className={inputClass} value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input required placeholder="City" className={inputClass} value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                  <input required placeholder="State / Province" className={inputClass} value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input required placeholder="Postal Code" className={inputClass} value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
                  <input required placeholder="Country" className={inputClass} value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
                </div>
              </div>

              <div className="mb-8 space-y-3 border-t border-border/20 pt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Billing Information</h3>
                <input required placeholder="Name on Card" autoComplete="off" className={inputClass} value={cardName} onChange={(e) => setCardName(e.target.value)} />
                <input required placeholder="Card Number" autoComplete="off" maxLength={19} className={inputClass} value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())} />
                <div className="grid grid-cols-2 gap-3">
                  <input required placeholder="Expiry Date (MM/YY)" autoComplete="off" maxLength={5} className={inputClass} value={expiryDate} onChange={handleExpiryChange} />
                  <input required placeholder="CVC/CVV" autoComplete="off" maxLength={4} className={inputClass} value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))} />
                </div>

                <label className="flex items-center gap-2 mt-4 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-foreground rounded border-border focus:ring-foreground" checked={sameAsShipping} onChange={(e) => setSameAsShipping(e.target.checked)} />
                  Billing address is same as shipping
                </label>

                {!sameAsShipping && (
                  <div className="space-y-3 mt-4">
                    <input required placeholder="Street Address" className={inputClass} value={billingAddress.line1} onChange={(e) => setBillingAddress({ ...billingAddress, line1: e.target.value })} />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input required placeholder="City" className={inputClass} value={billingAddress.city} onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })} />
                      <input required placeholder="State" className={inputClass} value={billingAddress.state} onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })} />
                      <input required placeholder="Postal Code" className={inputClass} value={billingAddress.postalCode} onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>

              {validationError && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-sm text-sm border border-red-100 font-medium text-center">
                  {validationError}
                </div>
              )}

              <div className="mt-auto">
                <button
                  type="submit"
                  disabled={isProcessingWhop}
                  className="w-full bg-foreground text-background font-bold uppercase tracking-wider py-4 hover:opacity-80 transition-opacity disabled:opacity-50 flex justify-center items-center gap-3"
                >
                  {isProcessingWhop ? (
                    <>
                      <span className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin"></span>
                      Processing Payment...
                    </>
                  ) : (
                    `Pay $${currentTotal.toFixed(2)}`
                  )}
                </button>
                <p className="text-xs text-muted mt-3 text-center uppercase tracking-wider">
                  Payments are securely processed.
                </p>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
