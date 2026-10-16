import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetailInteractive from "./ProductDetailInteractive";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    await dbConnect();
    // Pre-render the top 50 newest products
    const products = await Product.find({}, { _id: 1 })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return products.map((product) => ({
      id: product._id.toString(),
    }));
  } catch (e) {
    console.error("Failed to generate static params", e);
    return [];
  }
}

async function getProduct(id) {
  try {
    await dbConnect();
    const product = await Product.findById(id).lean();
    if (!product) return null;
    return {
      ...product,
      _id: product._id.toString(),
      variants: product.variants.map((v) => ({ ...v, _id: v._id.toString() })),
    };
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const price = product.variants?.[0]?.price ? `$${product.variants[0].price.toFixed(2)}` : '';
  const cleanDescription = (product.description || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  const images = product.images?.[0] ? [product.images[0]] : [];

  return {
    title: `${product.name} ${price ? `— ${price}` : ''}`,
    description: cleanDescription || `Shop ${product.name} at Velloura Collective. Curated luxury women's fashion and beauty with fast shipping.`,
    openGraph: {
      title: `${product.name} | Velloura Collective`,
      description: cleanDescription,
      images,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Velloura Collective`,
      description: cleanDescription,
      images,
    },
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex text-sm text-muted mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
          <ProductDetailInteractive product={product} />
        </div>
      </div>
    </div>
  );
}
