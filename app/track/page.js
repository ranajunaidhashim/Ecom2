'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, email })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-foreground mb-3">Track Your Order</h1>
          <p className="text-muted">Enter your Order ID and Email address to see your fulfillment status.</p>
        </div>

        {!order ? (
          <form onSubmit={handleTrack} className="bg-surface border border-border rounded-2xl p-8 max-w-lg mx-auto shadow-sm">
            {error && (
              <div className="mb-6 p-4 bg-danger/10 text-danger rounded-lg border border-danger/30 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Order ID</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 64b1f... or pi_3N..."
                  className="w-full bg-elevated border border-border text-foreground placeholder-muted rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="The email used at checkout"
                  className="w-full bg-elevated border border-border text-foreground placeholder-muted rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !orderId || !email}
              className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-4 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            <button 
              onClick={() => setOrder(null)}
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              &larr; Track another order
            </button>

            {/* Status Timeline */}
            <div className="bg-surface border border-border rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-8">Order Status</h2>
              
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-border -translate-y-1/2 rounded-full hidden sm:block"></div>
                
                {/* dynamic fill line */}
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full hidden sm:block transition-all duration-1000"
                  style={{ 
                    width: order.status === 'pending' ? '0%' : 
                           order.status === 'paid' ? '50%' : 
                           order.status === 'fulfilled' ? '100%' : '0%' 
                  }}
                ></div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0 relative z-10">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mb-3 shadow-[0_0_0_4px_var(--bg-surface)]">
                      ✓
                    </div>
                    <span className="font-semibold text-foreground">Order Placed</span>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-3 shadow-[0_0_0_4px_var(--bg-surface)] transition-colors ${
                      ['paid', 'fulfilled'].includes(order.status) ? 'bg-primary text-primary-foreground' : 'bg-elevated border-2 border-border text-muted'
                    }`}>
                      {['paid', 'fulfilled'].includes(order.status) ? '✓' : '2'}
                    </div>
                    <span className={`font-semibold ${['paid', 'fulfilled'].includes(order.status) ? 'text-foreground' : 'text-muted'}`}>
                      Payment Confirmed
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-3 shadow-[0_0_0_4px_var(--bg-surface)] transition-colors ${
                      order.status === 'fulfilled' ? 'bg-primary text-primary-foreground' : 'bg-elevated border-2 border-border text-muted'
                    }`}>
                      {order.status === 'fulfilled' ? '✓' : '3'}
                    </div>
                    <span className={`font-semibold ${order.status === 'fulfilled' ? 'text-foreground' : 'text-muted'}`}>
                      Shipped
                    </span>
                  </div>
                </div>
              </div>
              
              {order.status === 'cancelled' && (
                <div className="mt-8 p-4 bg-danger/10 text-danger rounded-xl border border-danger/30 text-center font-semibold">
                  This order has been cancelled.
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-border bg-elevated/50">
                <h3 className="font-semibold text-foreground">Order Details</h3>
                <p className="text-sm text-muted">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-elevated rounded-lg overflow-hidden relative border border-border flex-shrink-0">
                        {item.productId?.images?.[0] ? (
                          <Image src={item.productId.images[0]} alt="" fill sizes="64px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-muted">No Img</div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-medium text-foreground truncate">{item.productId?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-muted">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-semibold text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-border pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-muted">
                    <span>Shipping</span>
                    <span>{order.shippingCost === 0 ? 'Free' : `$${order.shippingCost.toFixed(2)}`}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount ({order.discountCode})</span>
                      <span>-${order.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg text-foreground pt-2">
                    <span>Total Paid</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm text-sm">
              <h3 className="font-semibold text-foreground mb-3">Shipping To</h3>
              <p className="text-muted">{order.customerName}</p>
              <p className="text-muted">{order.shippingAddress.line1}</p>
              <p className="text-muted">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p className="text-muted">{order.shippingAddress.country}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

