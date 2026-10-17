'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState({ metrics: null, recentOrders: [], role: null, isSuperAdmin: false });
  const [loading, setLoading] = useState(true);

  const loadDashboard = () => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted">
        <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
        <span className="text-sm font-medium">Loading dashboard...</span>
      </div>
    );
  }

  const { metrics, recentOrders, isSuperAdmin } = data;

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Welcome back. Here&apos;s an overview of your store activity.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isSuperAdmin && (
            <Link
              href="/admin/settings"
              className="px-4 py-2 bg-surface border border-border text-foreground font-semibold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:bg-elevated transition-colors"
            >
              Settings
            </Link>
          )}
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:opacity-90 transition-opacity"
          >
            + Add Product
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-surface border border-border text-foreground font-semibold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:bg-elevated transition-colors"
          >
            Orders
          </Link>
        </div>
      </div>

      {/* METRICS: Total Revenue & Total Orders ONLY shown to Super Admin */}
      {isSuperAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-sm hover:border-foreground/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Total Revenue</span>
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
            </div>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              ${(metrics?.totalRevenue || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted mt-2">Verified completed orders</p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-sm hover:border-foreground/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Total Orders</span>
              <span className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </span>
            </div>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              {metrics?.totalOrders || 0}
            </div>
            <p className="text-xs text-muted mt-2">All recorded customer orders</p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-sm hover:border-foreground/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Products in Store</span>
              <span className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </span>
            </div>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              {metrics?.totalProducts || 0}
            </div>
            <p className="text-xs text-muted mt-2">Active catalog items</p>
          </div>
        </div>
      ) : (
        /* Regular Admin View: Only show Products and Quick Actions */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-sm hover:border-foreground/30 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Products in Store</span>
              <span className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              </span>
            </div>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              {metrics?.totalProducts || 0}
            </div>
            <p className="text-xs text-muted mt-2">Active items in store catalog</p>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 shadow-sm hover:border-foreground/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">Store Management</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-sm font-semibold text-foreground">Catalog & Orders Access</p>
              <p className="text-xs text-muted mt-1">Manage listings, edit inventory, and fulfill incoming orders.</p>
            </div>
            <div className="flex gap-2.5 mt-4">
              <Link
                href="/admin/products"
                className="px-3.5 py-2 bg-elevated hover:bg-border text-foreground font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                View Catalog
              </Link>
              <Link
                href="/admin/orders"
                className="px-3.5 py-2 bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-wider rounded-lg hover:opacity-90 transition-opacity"
              >
                Manage Orders
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* RECENT ORDERS TABLE */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border flex justify-between items-center bg-surface">
          <div>
            <h2 className="text-base font-bold text-foreground">Recent Orders</h2>
            <p className="text-xs text-muted mt-0.5">Latest customer purchases</p>
          </div>
          <Link href="/admin/orders" className="text-xs text-foreground font-semibold hover:underline uppercase tracking-wider">
            View All &rarr;
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-muted text-sm">No recent orders found.</div>
        ) : (
          <>
            {/* Desktop / Tablet Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-elevated border-b border-border text-foreground font-bold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Order ID</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Total</th>
                    <th className="px-5 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-elevated/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-foreground/80 font-medium">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-5 py-3.5 text-foreground font-semibold">
                        {order.customerName || 'Customer'}
                      </td>
                      <td className="px-5 py-3.5 text-muted text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-foreground">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'paid' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                          order.status === 'fulfilled' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30' :
                          order.status === 'cancelled' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30' :
                          'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="sm:hidden divide-y divide-border">
              {recentOrders.map((order) => (
                <div key={order._id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      order.status === 'paid' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' :
                      order.status === 'fulfilled' ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30' :
                      order.status === 'cancelled' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium">{order.customerName || 'Customer'}</span>
                    <span className="text-muted">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right font-bold text-foreground text-sm">
                    ${order.totalAmount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
