'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const CATEGORY_LABEL = { cosmetics: 'Cosmetics', dental: 'Dental', toys: 'Toys', other: 'Other' };
const CATEGORY_DOT = { cosmetics: 'bg-primary', dental: 'bg-secondary', toys: 'bg-warning', other: 'bg-muted' };

function StockBadge({ stock }) {
  if (stock <= 0) return <span className="px-2 py-0.5 rounded-full bg-danger/15 text-danger text-xs font-medium">Out of stock</span>;
  if (stock < 10) return <span className="px-2 py-0.5 rounded-full bg-warning/15 text-warning text-xs font-medium">{stock} left</span>;
  return <span className="px-2 py-0.5 rounded-full bg-success/15 text-success text-xs font-medium">{stock} in stock</span>;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load products');
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    // load() sets state only after its internal await (network response),
    // never synchronously within this effect body, so there's no cascading
    // render here — just the standard fetch-on-mount pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const stats = useMemo(() => {
    if (!products) return null;
    const totalStock = products.reduce((sum, p) => sum + (p.variants || []).reduce((s, v) => s + (v.stock || 0), 0), 0);
    const lowStock = products.filter((p) => (p.variants || []).some((v) => v.stock > 0 && v.stock < 10)).length;
    const outOfStock = products.filter((p) => (p.variants || []).every((v) => (v.stock || 0) <= 0)).length;
    return { total: products.length, totalStock, lowStock, outOfStock };
  }, [products]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted mt-1 text-sm">Manage everything in your catalog — manual or synced.</p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
            <p className="text-muted text-xs uppercase tracking-wider font-medium mb-1">Total Products</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
            <p className="text-muted text-xs uppercase tracking-wider font-medium mb-1">Units in Stock</p>
            <p className="text-2xl font-bold text-primary">{stats.totalStock}</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
            <p className="text-muted text-xs uppercase tracking-wider font-medium mb-1">Low Stock</p>
            <p className="text-2xl font-bold text-warning">{stats.lowStock}</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-card">
            <p className="text-muted text-xs uppercase tracking-wider font-medium mb-1">Out of Stock</p>
            <p className="text-2xl font-bold text-danger">{stats.outOfStock}</p>
          </div>
        </div>
      )}

      {error && <div className="mb-6 p-4 bg-danger/10 text-danger rounded-lg border border-danger/30">{error}</div>}

      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-card">
        {products === null ? (
          <div className="p-12 text-center text-muted">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-muted">No products yet. Add your first one to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-elevated text-muted uppercase text-xs tracking-wider">
                <tr>
                  <th className="text-left py-3 px-6">Product</th>
                  <th className="text-left py-3 px-6">Category</th>
                  <th className="text-left py-3 px-6">Variants</th>
                  <th className="text-left py-3 px-6">Stock</th>
                  <th className="text-left py-3 px-6">Source</th>
                  <th className="text-right py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => {
                  const totalStock = (p.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
                  return (
                    <tr key={p._id} className="hover:bg-elevated/60 transition-colors">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-elevated overflow-hidden flex-shrink-0 relative">
                            {p.images && p.images[0] && (
                              <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />
                            )}
                          </div>
                          <span className="font-medium text-foreground">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-muted">
                        <span className="inline-flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_DOT[p.category] || CATEGORY_DOT.other}`}></span>
                          {CATEGORY_LABEL[p.category] || p.category}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-muted">{p.variants?.length || 0}</td>
                      <td className="py-3 px-6"><StockBadge stock={totalStock} /></td>
                      <td className="py-3 px-6">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-elevated text-muted text-xs capitalize border border-border">{p.source}</span>
                      </td>
                      <td className="py-3 px-6 text-right space-x-4 whitespace-nowrap">
                        <Link href={`/admin/products/${p._id}/edit`} className="text-primary hover:underline">Edit</Link>
                        <button
                          onClick={() => handleDelete(p._id)}
                          disabled={deletingId === p._id}
                          className="text-danger hover:underline disabled:opacity-50"
                        >
                          {deletingId === p._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
