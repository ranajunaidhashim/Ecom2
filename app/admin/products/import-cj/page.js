'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = [
  { value: 'bags', label: 'Bags' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'bracelet', label: 'Bracelet' },
  { value: 'cosmetics', label: 'Cosmetics' },
  { value: 'dental', label: 'Dental Care' },
  { value: 'ear-rings', label: 'Ear Rings' },
  { value: 'human-hair-wigs', label: 'Human Hair Wigs' },
  { value: 'rings', label: 'Rings' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'sunglasses', label: 'Sunglasses' },
  { value: 'swimwear', label: 'Swimwear' },
  { value: 'toys', label: 'Toys & Gifts' },
  { value: 'women-clothes', label: 'Women Clothes' },
  { value: 'other', label: 'Other' },
];

export default function ImportCjPage() {
  const router = useRouter();
  const [pid, setPid] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [previewData, setPreviewData] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFetch = async (e) => {
    e.preventDefault();
    if (!pid.trim()) return;

    setLoading(true);
    setError('');
    setPreviewData(null);

    try {
      const res = await fetch(`/api/admin/cj/product?input=${encodeURIComponent(pid.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch product');

      setPreviewData(data.product);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(previewData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      router.push('/admin/products');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const updateVariantPrice = (index, newPrice) => {
    const updatedVariants = [...previewData.variants];
    updatedVariants[index].price = parseFloat(newPrice) || 0;
    setPreviewData({ ...previewData, variants: updatedVariants });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/admin/products" className="text-sm text-muted hover:text-foreground mb-4 inline-block">&larr; Back to Products</Link>
        <h1 className="text-2xl font-bold text-foreground">Import from CJ Dropshipping</h1>
        <p className="text-muted mt-1 text-sm">Fetch a product directly from CJ Dropshipping using its Product ID.</p>
      </div>

      {/* Step 1: Fetch */}
      <div className="bg-surface rounded-2xl border border-border p-6 shadow-card mb-8">
        <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="CJ Product ID, SKU, or Full Product URL..."
            value={pid}
            onChange={(e) => setPid(e.target.value)}
            className="flex-grow border border-border bg-elevated text-foreground rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !pid.trim()}
            className="bg-foreground hover:bg-foreground/90 text-background font-semibold py-3 px-8 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {loading ? 'Fetching...' : 'Fetch Data'}
          </button>
        </form>
        {error && <div className="mt-4 p-4 bg-danger/10 text-danger rounded-lg border border-danger/30 text-sm">{error}</div>}
      </div>

      {/* Step 2: Preview & Edit */}
      {previewData && (
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-card animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-lg font-bold text-foreground mb-6 pb-4 border-b border-border">Preview &amp; Configure Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Image Preview */}
            <div className="col-span-1">
              <div className="w-full aspect-square rounded-xl bg-elevated overflow-hidden border border-border relative">
                {previewData.images && previewData.images[0] ? (
                  <Image src={previewData.images[0]} alt="Preview" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">No Image</div>
                )}
              </div>
              <p className="text-xs text-muted text-center mt-2">{previewData.images?.length || 0} images imported</p>
            </div>

            {/* Basic Info */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Product Name</label>
                <input
                  type="text"
                  value={previewData.name}
                  onChange={(e) => setPreviewData({ ...previewData, name: e.target.value })}
                  className="w-full border border-border bg-surface text-foreground rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                  <select
                    value={previewData.category}
                    onChange={(e) => setPreviewData({ ...previewData, category: e.target.value })}
                    className="w-full border border-border bg-surface text-foreground rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Shipping Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={previewData.shippingCost}
                    onChange={(e) => setPreviewData({ ...previewData, shippingCost: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-border bg-surface text-foreground rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Variants & Pricing */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-foreground">Variants &amp; Pricing</h3>
            </div>

            <div className="bg-elevated rounded-xl border border-border overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="bg-subtle text-muted text-xs uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Variant</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">CJ Cost</th>
                    <th className="px-4 py-3">Retail Price</th>
                    {/* <th className="px-4 py-3">Profit</th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {previewData.variants.map((variant, idx) => (
                    <tr key={idx} className="bg-surface">
                      <td className="px-4 py-3 font-medium text-foreground">{variant.label}</td>
                      <td className="px-4 py-3 text-muted">{variant.sku || '-'}</td>
                      <td className="px-4 py-3 text-muted">${variant.costPrice.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="text-muted mr-1">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.price}
                            onChange={(e) => updateVariantPrice(idx, e.target.value)}
                            className="w-20 border border-border rounded px-2 py-1 outline-none focus:border-primary"
                          />
                        </div>
                      </td>
                      {/* <td className="px-4 py-3">
                        <span className="text-success font-medium">
                          +${Math.max(0, variant.price - variant.costPrice).toFixed(2)}
                        </span>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
              {!saving && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

