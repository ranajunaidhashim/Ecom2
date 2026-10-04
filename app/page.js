import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { unstable_cache } from "next/cache";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";

export const revalidate = 86400; // 24 hours

const getFeaturedProducts = unstable_cache(
  async () => {
    try {
      await dbConnect();
      const products = await Product.find({}, { name: 1, images: 1, category: 1, variants: 1, shippingCost: 1 }).sort({ createdAt: -1 }).limit(40).lean();
      return products.map(p => ({
        ...p,
        _id: p._id.toString(),
        variants: p.variants.map(v => ({ ...v, _id: v._id.toString() }))
      }));
    } catch (error) {
      console.error("Failed to fetch featured products", error);
      return [];
    }
  },
  ['featured-products'],
  { revalidate: 86400, tags: ['products'] }
);

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col bg-background">
      {/* ===== HERO CAROUSEL ===== */}
      <HeroCarousel />

      {/* ===== FEATURED COLLECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-widest uppercase mb-4">
              Featured Collection
            </h2>
            <div className="w-16 h-1 bg-foreground"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {featuredProducts.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-muted mb-4 uppercase tracking-widest font-semibold">No products available</p>
                <Link href="/admin/login" className="inline-block border-2 border-foreground text-foreground px-8 py-3 font-bold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors">
                  Go to Store Admin
                </Link>
              </div>
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
          
          {featuredProducts.length > 0 && (
            <div className="mt-16 flex justify-center">
              <Link href="/products" className="inline-block border-2 border-foreground text-foreground px-10 py-4 font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors">
                View All Products
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
