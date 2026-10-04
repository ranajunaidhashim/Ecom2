'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProductForm from '../../ProductForm';

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/admin/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProduct(data.product);
      })
      .catch((err) => setError(err.message));
  }, [params.id]);

  const handleSubmit = async (payload) => {
    const response = await fetch(`/api/admin/products/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to update product');
    }

    router.push('/admin/products');
    router.refresh();
  };

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
          <p className="text-muted mt-2">Update details, prices, or stock levels.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 text-danger rounded-lg border border-danger/30">{error}</div>
        )}

        {!product && !error ? (
          <div className="text-center py-20 text-muted">Loading...</div>
        ) : product ? (
          <ProductForm initialProduct={product} onSubmit={handleSubmit} submitLabel="Save Changes" />
        ) : null}
      </div>
    </div>
  );
}
