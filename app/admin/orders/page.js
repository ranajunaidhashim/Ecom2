'use client';

import { useState, useEffect } from 'react';

const STATUS_TABS = ['all', 'pending', 'paid', 'fulfilled', 'cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

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

  const filtered = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const renderItems = (order) => {
    if (!order.items?.length) return <span className="text-xs text-muted">—</span>;
    return order.items.map((item, idx) => {
      const product = item.productId;
      if (!product) return <div key={idx} className="text-xs text-muted">Unknown</div>;
      const variant = product.variants?.find(v => v._id?.toString() === item.variantId?.toString());
      return (
        <div key={idx} className="text-xs leading-relaxed">
          <span className="font-medium text-foreground">{item.quantity}×</span>{' '}
          <span className="text-muted">{product.name}</span>
          {variant?.label && variant.label !== 'Default' && (
            <span className="text-muted/60 ml-1">({variant.label})</span>
          )}
        </div>
      );
    });
  };

  const statusBadge = (status) => (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
      status === 'paid' ? 'bg-success/10 text-success' :
      status === 'fulfilled' ? 'bg-primary/10 text-primary' :
      status === 'cancelled' ? 'bg-danger/10 text-danger' :
      'bg-warning/10 text-warning'
    }`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted text-sm mt-1">{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-5 border-b border-border overflow-x-auto no-scrollbar">
        <div className="flex gap-0 min-w-max">
          {STATUS_TABS.map(tab => {
            const count = tab === 'all' ? orders.length : (counts[tab] || 0);
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}{' '}
                <span className={`text-xs ${isActive ? 'text-primary' : 'text-muted'}`}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center text-muted text-sm">Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted text-sm">
          {activeTab === 'all' ? 'No orders yet.' : `No ${activeTab} orders.`}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-auto max-h-[65vh]">
              <table className="w-full text-sm text-left">
                <thead className="bg-elevated text-muted text-xs uppercase tracking-wider border-b border-border sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Items</th>
                    <th className="px-5 py-3 font-medium">Payment</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(order => (
                    <tr key={order._id} className="hover:bg-elevated/40 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-muted whitespace-nowrap">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="text-foreground font-medium text-sm">{order.customerName}</div>
                        <div className="text-muted text-xs">{order.customerEmail}</div>
                        {order.dob && <div className="text-muted text-[10px] mt-0.5">DOB: {order.dob}</div>}
                      </td>
                      <td className="px-5 py-3 text-muted text-xs whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 min-w-[180px]">
                        {renderItems(order)}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted whitespace-nowrap">
                        Card (Viva)
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="text-foreground font-semibold text-sm">${order.totalAmount.toFixed(2)}</div>
                        {order.discountAmount > 0 && (
                          <div className="text-xs text-success">
                            {order.discountCode || 'Discount'} -${order.discountAmount.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">{statusBadge(order.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile / Tablet Cards */}
          <div className="lg:hidden max-h-[70vh] overflow-y-auto pr-1 space-y-3">
            {filtered.map(order => (
              <div key={order._id} className="bg-surface border border-border rounded-xl overflow-hidden">
                {/* Top bar: ID, Date, Status */}
                <div className="flex items-center justify-between px-4 py-3 bg-elevated/50 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted">#{order._id.slice(-6).toUpperCase()}</span>
                    <span className="text-xs text-muted">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  {statusBadge(order.status)}
                </div>

                <div className="p-4 space-y-3">
                  {/* Customer */}
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{order.customerName}</div>
                      <div className="text-xs text-muted truncate">{order.customerEmail}</div>
                      {order.dob && <div className="text-[10px] text-muted truncate mt-0.5">DOB: {order.dob}</div>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-semibold text-foreground">${order.totalAmount.toFixed(2)}</div>
                      <div className="text-[10px] text-muted">Card (Viva)</div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-elevated/40 rounded-lg px-3 py-2">
                    {renderItems(order)}
                  </div>

                  {/* Discount */}
                  {order.discountAmount > 0 && (
                    <div className="text-xs text-success">
                      {order.discountCode || 'Discount'} saved -${order.discountAmount.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
