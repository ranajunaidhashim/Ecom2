'use client';

import { useRouter } from 'next/navigation';
import ProductForm from '../ProductForm';

export default function AdminNewProductPage() {
  const router = useRouter();

  const handleSubmit = async (payload) => {
    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to create product');
    }

    router.push('/admin/products');
    router.refresh();
  };

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
          <p className="text-muted mt-2">Manually enter product details — no supplier integration needed.</p>
        </div>
        <ProductForm onSubmit={handleSubmit} submitLabel="Save Product to Store" />
      </div>
    </div>
  );
}
