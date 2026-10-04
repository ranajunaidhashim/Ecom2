'use client';

import { useState } from 'react';

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

const emptyVariant = { label: 'Default', price: '', costPrice: '', stock: '' };
const inputClass = 'w-full bg-elevated border border-border text-foreground placeholder-muted rounded-lg focus:ring-2 focus:ring-primary focus:border-primary p-3 outline-none';
const smallInputClass = 'w-full bg-elevated border border-border text-foreground rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-primary';

export default function ProductForm({ initialProduct, onSubmit, submitLabel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState(() => ({
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    category: initialProduct?.category || 'cosmetics',
    shippingCost: String(initialProduct?.shippingCost ?? 0),
    images: initialProduct?.images?.length > 0 ? initialProduct.images : [''],
    variants:
      initialProduct?.variants?.length > 0
        ? initialProduct.variants.map((v) => ({
            label: v.label,
            price: String(v.price),
            costPrice: String(v.costPrice ?? ''),
            stock: String(v.stock ?? ''),
          }))
        : [{ ...emptyVariant }],
  }));

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    setFormData({ ...formData, variants: [...formData.variants, { ...emptyVariant, label: '' }] });
  };

  const removeVariant = (index) => {
    setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) });
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImage = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImage = (index) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const images = formData.images
        .map((url) => url.trim())
        .filter(Boolean);

      const variants = formData.variants.map((v) => ({
        label: v.label || 'Default',
        price: parseFloat(v.price) || 0,
        costPrice: parseFloat(v.costPrice) || 0,
        stock: parseInt(v.stock, 10) || 0,
      }));

      await onSubmit({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        shippingCost: parseFloat(formData.shippingCost) || 0,
        images,
        variants,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border p-8 space-y-8">
      {error && (
        <div className="p-4 bg-danger/10 text-danger rounded-lg border border-danger/30">{error}</div>
      )}

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">Basic Info</h2>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Product Name</label>
          <input
            required
            type="text"
            className={inputClass}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Lavender Night Cream"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Category</label>
          <select
            className={inputClass}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Flat Shipping Cost ($)</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            className={inputClass}
            value={formData.shippingCost}
            onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
            placeholder="e.g. 5.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted mb-2">Description</label>
          <textarea
            required
            rows={4}
            className={inputClass}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of the product..."
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-muted">Product Images</label>
            <button
              type="button"
              onClick={addImage}
              className="text-sm bg-elevated hover:bg-border text-foreground py-1 px-2.5 rounded-md transition-colors border border-border"
            >
              + Add Image
            </button>
          </div>
          <p className="text-xs text-muted mb-2">The first image will be used as the primary display image.</p>
          {formData.images.map((img, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <span className={`text-xs font-medium px-2 py-1 rounded w-20 text-center ${index === 0 ? 'bg-primary/10 text-primary' : 'bg-elevated text-muted'}`}>
                {index === 0 ? 'Primary' : `Image ${index + 1}`}
              </span>
              <input
                type="text"
                className={`flex-grow ${smallInputClass}`}
                value={img}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="text-muted hover:text-danger p-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-border pb-2">
          <h2 className="text-xl font-semibold text-foreground">Variants (options, prices &amp; stock)</h2>
          <button
            type="button"
            onClick={addVariant}
            className="text-sm bg-elevated hover:bg-border text-foreground py-1.5 px-3 rounded-md transition-colors border border-border"
          >
            + Add Variant
          </button>
        </div>
        <p className="text-sm text-muted -mt-4">
          Selling a single simple item? Just leave one variant labeled &ldquo;Default&rdquo;. Add more rows for scents, colors, or sizes.
        </p>

        {formData.variants.map((variant, index) => (
          <div key={index} className="p-4 bg-elevated rounded-xl border border-border relative">
            {formData.variants.length > 1 && (
              <button
                type="button"
                onClick={() => removeVariant(index)}
                className="absolute top-2 right-2 text-muted hover:text-danger"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Option Label</label>
                <input
                  required
                  type="text"
                  className={smallInputClass}
                  value={variant.label}
                  onChange={(e) => handleVariantChange(index, 'label', e.target.value)}
                  placeholder="e.g. Rose - 50ml"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Retail Price ($)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  className={smallInputClass}
                  value={variant.price}
                  onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={smallInputClass}
                  value={variant.costPrice}
                  onChange={(e) => handleVariantChange(index, 'costPrice', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  className={smallInputClass}
                  value={variant.stock}
                  onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-4 px-8 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

