import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { unstable_cache } from "next/cache";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryMarquee from "@/components/CategoryMarquee";

export const revalidate = 300;

const getWigsProducts = unstable_cache(
  async () => {
    try {
      await dbConnect();
      const products = await Product.find(
        { category: { $regex: /wig|hair/i } },
        { name: 1, images: 1, category: 1, variants: 1, shippingCost: 1, description: 1 }
      ).sort({ createdAt: -1 }).limit(20).lean();

      return products.map(p => ({
        ...p,
        _id: p._id.toString(),
        variants: p.variants.map(v => ({ ...v, _id: v._id.toString() }))
      }));
    } catch (error) {
      console.error("Failed to fetch wigs products", error);
      return [];
    }
  },
  ['wigs-products'],
  { revalidate: 300, tags: ['products'] }
);

const getCategoryProducts = unstable_cache(
  async () => {
    try {
      await dbConnect();
      const targetCategories = [
        { name: "Women Clothes", values: ["women-clothes", "women"], value: "women-clothes" },
        { name: "Swimwear", values: ["swimwear", "bikini"], value: "swimwear" },
        { name: "Ear Rings", values: ["ear-rings", "earrings", "earring"], value: "ear-rings" },
        { name: "Rings", values: ["rings", "ring"], value: "rings" },
        { name: "Cosmetics", values: ["cosmetics", "cosmetic"], value: "cosmetics" },
        { name: "Beauty", values: ["beauty"], value: "beauty" },
        { name: "Bags", values: ["bags", "bag"], value: "bags" }
      ];

      const categoryResults = await Promise.all(
        targetCategories.map(async (cat) => {
          const filter = {
            $or: [
              { category: { $in: cat.values } },
              { category: { $regex: new RegExp(`^(${cat.values.join('|')})`, 'i') } }
            ]
          };

          const products = await Product.find(
            filter,
            { name: 1, images: 1, category: 1, variants: 1, shippingCost: 1, description: 1 }
          ).sort({ createdAt: -1 }).limit(10).lean();

          if (!products || products.length === 0) return null;

          return {
            name: cat.name,
            value: cat.value,
            products: products.map(p => ({
              ...p,
              _id: p._id.toString(),
              variants: p.variants.map(v => ({ ...v, _id: v._id.toString() }))
            }))
          };
        })
      );

      return categoryResults.filter(Boolean);
    } catch (error) {
      console.error("Failed to fetch category products", error);
      return [];
    }
  },
  ['category-sections-v2'],
  { revalidate: 60, tags: ['products'] }
);

export default async function Home() {
  const [wigsProducts, categorySections] = await Promise.all([
    getWigsProducts(),
    getCategoryProducts()
  ]);

  const hasAnyProducts = (wigsProducts && wigsProducts.length > 0) || (categorySections && categorySections.length > 0);

  return (
    <div className="flex flex-col bg-background">
      {/* ===== HERO CAROUSEL ===== */}
      <HeroCarousel />

      {/* ===== WIGS SECTION (Shown only when wig products exist) ===== */}
      {wigsProducts && wigsProducts.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-widest uppercase mb-4 text-center">
                Wigs &amp; Hair Collection
              </h2>
              <div className="w-16 h-1 bg-foreground"></div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {wigsProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <Link href="/products?category=human-hair-wigs" className="inline-block border-2 border-foreground text-foreground px-10 py-4 font-bold uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors">
                View More
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== CATEGORY SECTIONS (Shown for categories with products) ===== */}
      {categorySections.map((section, idx) => (
        <section
          key={section.name}
          className={`py-12 sm:py-16 overflow-hidden ${idx % 2 === 0 ? 'bg-surface' : 'bg-background'}`}
        >
          <div className="flex flex-col items-center mb-12 px-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-widest uppercase mb-4 text-center">
              {section.name}
            </h2>
            <div className="w-16 h-1 bg-foreground"></div>
          </div>

          <CategoryMarquee products={section.products} />

          <div className="mt-12 flex justify-center">
            <Link
              href={`/products?category=${encodeURIComponent(section.value)}`}
              className="inline-block border-2 border-foreground text-foreground px-10 py-4 font-bold uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors"
            >
              View More
            </Link>
          </div>
        </section>
      ))}

      {/* ===== ZERO PRODUCTS FALLBACK ===== */}
      {!hasAnyProducts && (
        <section className="py-20 sm:py-28 text-center bg-surface border-t border-border/20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-16 h-1 bg-foreground mx-auto mb-6"></div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground uppercase tracking-widest mb-3">
              New Collections Coming Soon
            </h2>
            <p className="text-muted text-sm sm:text-base leading-relaxed mb-8">
              We are currently curating and uploading our exclusive catalog with premium arrivals. Check back shortly to explore our newest selection!
            </p>
            <Link
              href="/products"
              className="inline-block border-2 border-foreground text-foreground px-10 py-4 font-bold uppercase tracking-widest hover:bg-foreground hover:text-white transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

