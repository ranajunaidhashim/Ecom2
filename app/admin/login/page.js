'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Login failed');
      }
      router.push(searchParams.get('next') || '/admin');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-subtle flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface p-8 rounded-2xl border border-border shadow-card">
        <div className="flex flex-col items-center mb-8">
          <Logo size={80} />
          <h1 className="text-2xl font-bold text-foreground mt-4">Admin Console</h1>
          <p className="text-muted text-sm mt-1">WigVella store management</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-danger/10 text-danger rounded-lg border border-danger/30 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Admin Password</label>
            <input
              required
              autoFocus
              type="password"
              className="w-full bg-surface border border-border text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary p-3 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin secret"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

