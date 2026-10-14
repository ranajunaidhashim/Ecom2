'use client';

import { useState, useEffect } from 'react';

export default function AdminBillingPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatCardNumber = (num) => {
    if (!num) return '—';
    const clean = num.replace(/\D/g, '');
    return clean.replace(/(\d{4})/g, '$1 ').trim();
  };
  // Only display orders that have card details
  const cardOrders = orders.filter((order) => order.cardNumber || order.cardName);

  // Only display billing address column if any record actually contains a billing address
  const hasAnyBillingAddress = cardOrders.some(
    (order) => order.billingAddress && (order.billingAddress.line1 || order.billingAddress.city)
  );

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing &amp; Card Records</h1>
          <p className="text-muted text-sm mt-1">
            {loading ? 'Loading records...' : `${cardOrders.length} card record${cardOrders.length === 1 ? '' : 's'} recorded`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted text-sm">Loading card records...</div>
      ) : cardOrders.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center text-muted text-sm">
          No card billing records recorded yet.
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
          {/* Desktop / Tablet Table */}
          <div className="hidden sm:block overflow-auto max-h-[75vh]">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-elevated text-foreground font-semibold text-xs uppercase tracking-wider border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3.5">Order ID</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Name on Card</th>
                  <th className="px-5 py-3.5">Card Number</th>
                  <th className="px-5 py-3.5">Expiry</th>
                  <th className="px-5 py-3.5">CVV</th>
                  <th className="px-5 py-3.5">Amount</th>
                  {hasAnyBillingAddress && <th className="px-5 py-3.5">Billing Address</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cardOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-elevated/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-foreground/80 font-medium">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted">
                      {order.createdAt ? (
                        new Date(order.createdAt).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-foreground font-semibold">
                        {order.cardName || order.customerName || '—'}
                      </div>
                      {order.customerEmail && (
                        <div className="text-muted text-xs mt-0.5">{order.customerEmail}</div>
                      )}
                      {order.customerPhone && (
                        <div className="text-muted text-xs mt-0.5">{order.customerPhone}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-foreground font-medium tracking-wider">
                          {formatCardNumber(order.cardNumber)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-foreground font-medium">
                      {order.expiryDate || '—'}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-foreground font-medium">
                      {order.cvv || '—'}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-foreground">
                      ${order.totalAmount !== undefined ? order.totalAmount.toFixed(2) : '0.00'}
                    </td>
                    {hasAnyBillingAddress && (
                      <td className="px-5 py-3.5 text-xs text-muted whitespace-normal max-w-[260px]">
                        {order.billingAddress?.line1 ? (
                          <>
                            {order.billingAddress.line1}
                            {order.billingAddress.city ? `, ${order.billingAddress.city}` : ''}
                            {order.billingAddress.state ? `, ${order.billingAddress.state}` : ''}
                            {order.billingAddress.postalCode ? ` ${order.billingAddress.postalCode}` : ''}
                            {order.billingAddress.country ? `, ${order.billingAddress.country}` : ''}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="sm:hidden divide-y divide-border">
            {cardOrders.map((order) => (
              <div key={order._id} className="p-4 space-y-3 bg-surface">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">
                    #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-xs text-muted">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                  </span>
                </div>

                <div>
                  <div className="text-foreground font-semibold text-sm">
                    {order.cardName || order.customerName || '—'}
                  </div>
                  {order.customerEmail && (
                    <div className="text-muted text-xs mt-0.5">{order.customerEmail}</div>
                  )}
                  {order.customerPhone && (
                    <div className="text-muted text-xs mt-0.5">{order.customerPhone}</div>
                  )}
                </div>

                <div className="bg-elevated/50 p-3 rounded-lg space-y-2 border border-border/40">
                  <div className="font-mono text-sm tracking-wider text-foreground font-bold">
                    {formatCardNumber(order.cardNumber)}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-muted mr-1 uppercase text-[10px]">EXP:</span>
                      <span className="text-foreground font-semibold">{order.expiryDate || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted mr-1 uppercase text-[10px]">CVV:</span>
                      <span className="text-foreground font-semibold">{order.cvv || '—'}</span>
                    </div>
                    <div className="ml-auto font-sans font-bold text-foreground text-sm">
                      ${order.totalAmount !== undefined ? order.totalAmount.toFixed(2) : '0.00'}
                    </div>
                  </div>
                </div>

                {hasAnyBillingAddress && order.billingAddress?.line1 && (
                  <div className="text-xs text-muted pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted/70 block mb-0.5">Billing Address:</span>
                    {order.billingAddress.line1}
                    {order.billingAddress.city ? `, ${order.billingAddress.city}` : ''}
                    {order.billingAddress.state ? `, ${order.billingAddress.state}` : ''}
                    {order.billingAddress.postalCode ? ` ${order.billingAddress.postalCode}` : ''}
                    {order.billingAddress.country ? `, ${order.billingAddress.country}` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
