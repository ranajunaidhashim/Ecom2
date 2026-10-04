'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState({ metrics: null, recentOrders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-muted">Loading dashboard...</div>;
  }

  const { metrics, recentOrders } = data;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted mt-2">Welcome back. Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="text-sm font-medium text-muted mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-foreground">${(metrics?.totalRevenue || 0).toFixed(2)}</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="text-sm font-medium text-muted mb-2">Total Orders</div>
          <div className="text-3xl font-bold text-foreground">{metrics?.totalOrders || 0}</div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="text-sm font-medium text-muted mb-2">Products in Store</div>
          <div className="text-3xl font-bold text-foreground">{metrics?.totalProducts || 0}</div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline font-medium">View All</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-muted">No recent orders.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-elevated border-b border-border text-muted">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-elevated/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-foreground font-medium">{order.customerName}</td>
                    <td className="px-6 py-4 text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-foreground">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.status === 'paid' ? 'bg-success/10 text-success' :
                        order.status === 'fulfilled' ? 'bg-primary/10 text-primary' :
                        order.status === 'cancelled' ? 'bg-danger/10 text-danger' :
                        'bg-warning/10 text-warning'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
