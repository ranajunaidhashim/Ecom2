'use client';

import { useState, useEffect } from 'react';

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ code: '', discountType: 'percentage', value: '' });
  const [error, setError] = useState('');

  const fetchDiscounts = async () => {
    try {
      const res = await fetch('/api/admin/discounts');
      const data = await res.json();
      if (data.discounts) setDiscounts(data.discounts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        value: parseFloat(formData.value) || 0,
      };
      
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create discount');
      
      setFormData({ code: '', discountType: 'percentage', value: '' });
      fetchDiscounts();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;
    try {
      await fetch(`/api/admin/discounts/${id}`, { method: 'DELETE' });
      fetchDiscounts();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await fetch(`/api/admin/discounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchDiscounts();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Discount Codes</h1>
        <p className="text-muted mt-2">Create and manage promotional codes for your customers.</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-semibold text-foreground mb-4">Create New Code</h2>
        {error && <div className="mb-4 p-3 bg-danger/10 text-danger rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-muted mb-1">Code (e.g. SUMMER20)</label>
            <input
              required
              type="text"
              className="w-full bg-elevated border border-border text-foreground rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary uppercase"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-muted mb-1">Type</label>
            <select
              className="w-full bg-elevated border border-border text-foreground rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary"
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>
          <div className="w-full sm:w-32">
            <label className="block text-sm font-medium text-muted mb-1">Value</label>
            <input
              required
              type="number"
              step="0.01"
              min="0"
              className="w-full bg-elevated border border-border text-foreground rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-primary-foreground font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Add Code'}
          </button>
        </form>
      </div>

      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading...</div>
        ) : discounts.length === 0 ? (
          <div className="p-8 text-center text-muted">No discount codes created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-elevated border-b border-border text-muted">
              <tr>
                <th className="px-6 py-4 font-medium">Code</th>
                <th className="px-6 py-4 font-medium">Discount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {discounts.map((discount) => (
                <tr key={discount._id} className="hover:bg-elevated/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">{discount.code}</td>
                  <td className="px-6 py-4 text-muted">
                    {discount.discountType === 'percentage' ? `${discount.value}%` : `$${discount.value.toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(discount._id, discount.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        discount.isActive ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'
                      }`}
                    >
                      {discount.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(discount._id)}
                      className="text-muted hover:text-danger p-2"
                    >
                      Delete
                    </button>
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

