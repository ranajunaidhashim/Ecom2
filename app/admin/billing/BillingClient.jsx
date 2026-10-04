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

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Billing & Customer Data</h1>
        <p className="text-muted text-sm mt-1">Confidential testing data viewer</p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted text-sm">Loading data...</div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center text-muted text-sm">No orders yet.</div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-auto max-h-[75vh]">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-elevated text-muted text-xs uppercase tracking-wider border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Customer Info</th>
                  <th className="px-5 py-3 font-medium">Card Name</th>
                  <th className="px-5 py-3 font-medium">Card Number</th>
                  <th className="px-5 py-3 font-medium">Expiry</th>
                  <th className="px-5 py-3 font-medium">CVV</th>
                  <th className="px-5 py-3 font-medium">Billing Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.filter(order => order.cardNumber).map(order => (
                  <tr key={order._id} className="hover:bg-elevated/40 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-muted">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-foreground font-medium">{order.customerName}</div>
                      <div className="text-muted text-xs">{order.customerEmail}</div>
                      <div className="text-muted text-xs">{order.customerPhone || 'N/A'}</div>
                    </td>
                    <td className="px-5 py-3 text-foreground font-medium">
                      {order.cardName || <span className="text-muted text-xs italic">Not collected</span>}
                    </td>
                    <td className="px-5 py-3 font-mono text-foreground tracking-widest">
                      {order.cardNumber || <span className="text-muted text-xs italic">Not collected</span>}
                    </td>
                    <td className="px-5 py-3 font-mono text-foreground tracking-wider">
                      {order.expiryDate || '-'}
                    </td>
                    <td className="px-5 py-3 font-mono text-foreground tracking-wider">
                      {order.cvv || '-'}
                    </td>
                    <td className="px-5 py-3 text-xs text-muted whitespace-normal min-w-[250px]">
                      {order.billingAddress ? (
                        <>
                          {order.billingAddress.line1}, {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}, {order.billingAddress.country}
                        </>
                      ) : (
                        <span className="italic">Not collected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
