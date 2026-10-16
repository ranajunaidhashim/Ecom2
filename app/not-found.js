import Link from 'next/link';

export const metadata = {
  title: 'Page Not Found | Velloura Collective',
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background px-4 py-16">
      <div className="max-w-md w-full text-center bg-surface border border-border rounded-2xl p-8 sm:p-10 shadow-sm">
        <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 bg-foreground/5 text-foreground rounded-full mb-4">
          404 Error
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-muted text-sm sm:text-base leading-relaxed mb-8">
          The page or product you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-foreground text-background font-bold text-xs uppercase tracking-widest px-6 py-3.5 hover:opacity-85 transition-opacity"
          >
            Back Home
          </Link>
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
