'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background px-4 py-16">
      <div className="max-w-md w-full text-center bg-surface border border-border rounded-2xl p-8 sm:p-10 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3 tracking-tight">
          Something went wrong
        </h2>
        <p className="text-muted text-sm leading-relaxed mb-8">
          We encountered an unexpected error while loading this page. Please try refreshing or return to the catalog.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center bg-foreground text-background font-bold text-xs uppercase tracking-widest px-6 py-3.5 hover:opacity-85 transition-opacity"
          >
            Try Again
          </button>
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center border-2 border-foreground text-foreground font-bold text-xs uppercase tracking-widest px-6 py-3.5 hover:bg-foreground hover:text-background transition-colors"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
