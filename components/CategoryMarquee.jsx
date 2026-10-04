'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from './CartContext';

export default function CategoryMarquee({ products = [] }) {
  const { setQuickViewProduct } = useCart();
  
  // Duplicate the products array to create a seamless infinite scroll.
  // By animating to -50% width, it loops perfectly over the duplicated content.
  const displayProducts = [...products, ...products, ...products, ...products];

  return (
    <div className="w-full overflow-hidden relative py-4 group flex items-center">
      <style jsx>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          animation: scroll-left 80s linear infinite;
        }
      `}</style>
      
      {/* Container that moves */}
      <div className="flex w-max animate-scroll-left group-hover:[animation-play-state:paused]">
        {displayProducts.map((product, idx) => {
          const variant = product.variants?.[0];
          const image = product.images?.[0];
          
          return (
            <div key={`${product._id}-${idx}`} className="w-[260px] sm:w-[300px] mx-3 flex-shrink-0">
              <div className="bg-white group/card border-none card-lift overflow-hidden flex flex-col h-full rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
                <Link href={`/products/${product._id}`} className="block relative">
                  <div className="bg-gray-50 aspect-[4/5] overflow-hidden relative">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(min-width: 640px) 300px, 260px"
                        className="object-cover group-hover/card:scale-110 transition-transform duration-700 ease-in-out"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-muted text-sm bg-gray-100">No Image</div>
                    )}
                    {product.category && (
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white text-black drop-shadow-md rounded-sm">
                          {product.categoryName || product.category}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="p-4 sm:p-5 flex flex-col flex-grow text-center">
                  <Link href={`/products/${product._id}`}>
                    <h3 className="font-bold text-foreground uppercase tracking-wide text-sm leading-snug hover:opacity-70 transition-opacity mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="font-extrabold text-foreground text-lg mb-4">
                    ${variant ? variant.price.toFixed(2) : '0.00'}
                  </div>
                  
                  <div className="mt-auto flex flex-col gap-2">
                    <button
                      onClick={() => setQuickViewProduct(product)}
                      className="w-full bg-foreground text-background font-bold text-xs uppercase tracking-wider py-3 hover:opacity-80 transition-opacity rounded-md"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
