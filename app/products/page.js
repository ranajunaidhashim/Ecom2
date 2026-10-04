import { dbConnect } from "@/lib/db";
import { unstable_cache } from "next/cache";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export const revalidate = 86400; // 24 hours

const PAGE_SIZE = 12;

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'bags', label: 'Bags' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'bracelet', label: 'Bracelet' },
  { value: 'cosmetics', label: 'Cosmetics' },
  { value: 'dental', label: 'Dental' },
  { value: 'ear-rings', label: 'Ear Rings' },
  { value: 'human-hair-wigs', label: 'Human Hair Wigs' },
  { value: 'rings', label: 'Rings' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'sunglasses', label: 'Sunglasses' },
  { value: 'swimwear', label: 'Swimwear' },
  { value: 'toys', label: 'Toys' },
  { value: 'women-clothes', label: 'Women Clothes' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

function buildSort(sort) {
  if (sort === 'price_asc') return { 'variants.0.price': 1 };
  if (sort === 'price_desc') return { 'variants.0.price': -1 };
  return { createdAt: -1 };
}

const getProductsCached = unstable_cache(
  async ({ category, search, sort, page }) => {
    try {
      await dbConnect();
      const query = {};
      if (category) query.category = category;
      if (search) {
        query.$text = { $search: search };
      }

      const totalCount = await Product.countDocuments(query);
      const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
      const safePage = Math.min(Math.max(1, page), totalPages);

      // If text search, sort by text score unless a specific sort is requested
      let sortConfig = buildSort(sort);
      if (search && sort === 'newest') {
        sortConfig = { score: { $meta: "textScore" } };
      }

      const projection = { name: 1, images: 1, category: 1, variants: 1, shippingCost: 1 };
      if (search) {
        projection.score = { $meta: "textScore" };
      }

      const products = await Product.find(query, projection)
        .sort(sortConfig)
        .skip((safePage - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean();

      return {
        products: products.map(p => ({
          ...p,
          _id: p._id.toString(),
          variants: p.variants.map(v => ({ ...v, _id: v._id.toString() }))
        })),
        totalPages,
        totalCount,
      };
    } catch (error) {
      console.error("Failed to fetch products", error);
      return { products: [], totalPages: 1, totalCount: 0 };
    }
  },
  ['products-list'],
  { revalidate: 86400, tags: ['products'] }
);

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const withGaps = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) withGaps.push('...');
    withGaps.push(p);
  });
  return withGaps;
}

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams?.category || '';
  const search = resolvedSearchParams?.search || '';
  const sort = resolvedSearchParams?.sort || 'newest';
  const page = parseInt(resolvedSearchParams?.page, 10) || 1;

  const { products, totalPages, totalCount } = await getProductsCached({ category, search, sort, page });

  const withParam = (extra) => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    if (sort && sort !== 'newest') params.set('sort', sort);
    Object.entries(extra).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    const qs = params.toString();
    return qs ? `/products?${qs}` : '/products';
  };

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Hero Section */}
      <div className="bg-black py-16 sm:py-24 relative overflow-hidden mb-10">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-50">
          <img
            src="/cover1 (0).jfif"
            alt="Products background"
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
            {search ? `Results for "${search}"` : 'The Collection'}
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto font-medium drop-shadow-md">
            Discover our curated selection of premium products, designed to elevate your everyday.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Left Sidebar: Categories */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-6 hidden lg:block">Categories</h3>

              {/* Mobile: Horizontal Scroll | Desktop: Vertical List */}
              <div className="w-full overflow-x-auto no-scrollbar lg:overflow-visible">
                <div className="flex lg:flex-col gap-3 lg:gap-1 pb-4 lg:pb-0 w-max lg:w-auto">
                  {CATEGORIES.map((c) => {
                    const isActive = category === c.value;
                    return (
                      <Link
                        key={c.value}
                        href={withParam({ category: c.value, page: '' })}
                        className={`px-5 py-2.5 lg:px-4 lg:py-2.5 rounded-full lg:rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between ${isActive
                            ? 'bg-foreground text-background lg:bg-primary/10 lg:text-primary shadow-md lg:shadow-none'
                            : 'bg-surface lg:bg-transparent border border-border lg:border-transparent text-muted hover:text-foreground hover:bg-subtle'
                          }`}
                      >
                        {c.label}
                        {isActive && <span className="hidden lg:block w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(123,75,148,0.6)]" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content: Products & Sort */}
          <div className="flex-1 min-w-0">
            {/* Header / Sort Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border">
              <p className="text-sm text-muted font-medium w-full sm:w-auto text-center sm:text-left">
                {totalCount > 0 ? `Showing ${totalCount} product${totalCount === 1 ? '' : 's'}` : 'No products found'}
              </p>

              {/* Minimalist Sort */}
              <div className="flex items-center gap-4 text-sm w-full sm:w-auto">
                <span className="text-muted hidden sm:inline uppercase tracking-wider text-xs font-bold">Sort:</span>
                <div className="w-full overflow-x-auto no-scrollbar">
                  <div className="flex gap-5 sm:gap-6 w-max pb-1">
                    {SORT_OPTIONS.map((s) => {
                      const isActive = sort === s.value;
                      return (
                        <Link
                          key={s.value}
                          href={withParam({ sort: s.value === 'newest' ? '' : s.value, page: '' })}
                          className={`transition-all duration-300 font-semibold text-sm pb-1 border-b-2 ${isActive
                              ? 'text-primary border-primary'
                              : 'text-muted hover:text-foreground border-transparent hover:border-border'
                            }`}
                        >
                          {s.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {products.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-subtle rounded-2xl border border-border">
                  <p className="text-xl text-muted mb-4">No products found.</p>
                  <Link href="/products" className="text-primary font-medium hover:underline">Clear filters</Link>
                </div>
              ) : (
                products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              )}
            </div>

            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-2 mt-14 flex-wrap" aria-label="Pagination">
                <Link
                  href={withParam({ page: String(Math.max(1, page - 1)) })}
                  aria-disabled={page === 1}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${page === 1
                      ? 'border-border text-muted/40 pointer-events-none'
                      : 'border-border text-muted hover:text-foreground hover:border-primary/40'
                    }`}
                >
                  &larr; Prev
                </Link>

                {pageNumbers.map((p, i) =>
                  p === '...' ? (
                    <span key={`gap-${i}`} className="px-2 text-muted text-sm">&hellip;</span>
                  ) : (
                    <Link
                      key={p}
                      href={withParam({ page: p === 1 ? '' : String(p) })}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${p === page
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted hover:text-foreground hover:border-primary/40'
                        }`}
                    >
                      {p}
                    </Link>
                  )
                )}

                <Link
                  href={withParam({ page: String(Math.min(totalPages, page + 1)) })}
                  aria-disabled={page === totalPages}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${page === totalPages
                      ? 'border-border text-muted/40 pointer-events-none'
                      : 'border-border text-muted hover:text-foreground hover:border-primary/40'
                    }`}
                >
                  Next &rarr;
                </Link>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

