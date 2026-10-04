'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartContext';

export default function ProductCard({ product }) {
  const { setQuickViewProduct } = useCart();
  const variant = product.variants?.[0];
  const image = product.images?.[0];

  return (
    <div className="group bg-surface border-none card-lift overflow-hidden flex flex-col">
      <Link href={`/products/${product._id}`} className="block relative">
        <div className="bg-white aspect-[3/4] overflow-hidden relative">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-muted text-sm bg-gray-100">No Image</div>
          )}
          {product.category && (
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white text-black drop-shadow-md">
                {product.category}
              </span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4 sm:p-5 flex flex-col flex-grow text-center">
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-foreground uppercase tracking-wide text-sm sm:text-base leading-snug hover:opacity-70 transition-opacity mb-2">
            {product.name}
          </h3>
        </Link>
        <div className="font-bold text-foreground text-lg mb-4">
          ${variant ? variant.price.toFixed(2) : '0.00'}
        </div>
        
        <div className="mt-auto">
          <button
            onClick={() => setQuickViewProduct(product)}
            className="w-full bg-foreground text-background font-bold text-sm uppercase tracking-wider py-3 hover:opacity-80 transition-opacity"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

