import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { unstable_cache } from "next/cache";
import Product from "@/models/Product";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryMarquee from "@/components/CategoryMarquee";

export const revalidate = 86400; // 24 hours

const getWigsProducts = unstable_cache(
  async () => {
    try {
      await dbConnect();
      const products = await Product.find(
        { category: { $regex: /wig|hair/i } }, 
        { name: 1, images: 1, category: 1, variants: 1, shippingCost: 1 }
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
  { revalidate: 86400, tags: ['products'] }
);

const getCategoryProducts = unstable_cache(
  async () => {
    try {
      await dbConnect();
      const targetCategories = [
        { name: "Women Clothes", regex: "women", value: "women-clothes" },
        { name: "Ear Rings", regex: "ear", value: "ear-rings" },
        { name: "Cosmetics", regex: "cosmetic", value: "cosmetics" },
        { name: "Beauty", regex: "beauty", value: "beauty" },
        { name: "Bags", regex: "bag", value: "bags" }
      ];
      const categorySections = [];

      for (const cat of targetCategories) {
        const products = await Product.find(
          { category: { $regex: new RegExp(cat.regex, "i") } },
          { name: 1, images: 1, category: 1, variants: 1, shippingCost: 1 }
        ).sort({ createdAt: -1 }).limit(10).lean();

        if (products.length > 0) {
          categorySections.push({
            name: cat.name,
            value: cat.value,
            products: products.map(p => ({
              ...p,
              _id: p._id.toString(),
              variants: p.variants.map(v => ({ ...v, _id: v._id.toString() }))
            }))
          });
        }
      }

      return categorySections;
    } catch (error) {
      console.error("Failed to fetch category products", error);
      return [];
    }
  },
  ['category-sections'],
  { revalidate: 86400, tags: ['products'] }
);

export default async function Home() {
  const wigsProducts = await getWigsProducts();
  const categorySections = await getCategoryProducts();

  return (
    <div className="flex flex-col bg-background">
      {/* ===== HERO CAROUSEL ===== */}
      <HeroCarousel />

      {/* ===== WIGS SECTION ===== */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-widest uppercase mb-4 text-center">
              Wigs & Hair Collection
            </h2>
            <div className="w-16 h-1 bg-foreground"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {wigsProducts.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-muted mb-4 uppercase tracking-widest font-semibold">No products available</p>
              </div>
            ) : (
              wigsProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
          
          <div className="mt-16 flex justify-center">
            <Link href="/products?category=human-hair-wigs" className="inline-block border-2 border-foreground text-foreground px-10 py-4 font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors">
              View More
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CATEGORY SECTIONS ===== */}
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
              className="inline-block border-2 border-foreground text-foreground px-10 py-4 font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
            >
              View More
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}
