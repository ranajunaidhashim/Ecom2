'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    image: '/cover1.jfif',
    title: 'Special offers',
    subtitle: 'Save big on selected items',
    link: '/products',
    buttonText: 'View deals',
  },
  {
    id: 2,
    image: '/wigscover.jfif',
    title: 'Premium Quality',
    subtitle: 'Discover our top rated collection',
    link: '/products',
    buttonText: 'Shop Now',
  },
  {
    id: 3,
    image: '/cover1 (0).jfif',
    title: 'New Arrivals',
    subtitle: 'Upgrade your look today',
    link: '/products',
    buttonText: 'Explore',
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full flex flex-col items-center pb-10">
      {/* Marquee Ticker */}
      <div className="w-full bg-foreground overflow-hidden whitespace-nowrap py-3 flex items-center border-b border-border/10">
        <div className="animate-[marquee_40s_linear_infinite] inline-block">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="inline-flex items-center mx-4">
              <span className="bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mr-3">
                JUST PAY SHIPPING FEE
              </span>
              <span className="text-white text-sm font-semibold tracking-widest uppercase">
                HURRY UP DON'T WASTE YOUR TIME • 100% OFF
              </span>
            </span>
          ))}
        </div>
        <div className="animate-[marquee_40s_linear_infinite] inline-block">
          {[...Array(6)].map((_, i) => (
            <span key={'b' + i} className="inline-flex items-center mx-4">
              <span className="bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mr-3">
                JUST PAY SHIPPING FEE
              </span>
              <span className="text-white text-sm font-semibold tracking-widest uppercase">
                HURRY UP DON'T WASTE YOUR TIME • 100% OFF
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="w-full relative">
        <div className="relative w-full overflow-hidden bg-black h-[calc(100vh-120px)] flex flex-col items-center justify-center text-center">
          
          {/* Background Images */}
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'
              }`}
            >
              <Image 
                src={slide.image} 
                alt={slide.title} 
                fill 
                className={`object-cover object-center transition-transform duration-[8000ms] ease-linear ${
                  index === currentSlide ? 'scale-105' : 'scale-100'
                }`}
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}

          {/* Decorative background element if needed */}
          <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-cover mix-blend-overlay z-0 pointer-events-none"></div>

          {/* Content */}
          <div className="relative z-10 px-4 transition-all duration-700 transform translate-y-0 opacity-100">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold text-white tracking-tight mb-4 uppercase drop-shadow-lg">
              {slides[currentSlide].title}
            </h1>
            <p className="text-xl sm:text-3xl text-white/90 font-medium mb-8 uppercase tracking-wider drop-shadow-md">
              {slides[currentSlide].subtitle}
            </p>
            <Link
              href={slides[currentSlide].link}
              className="inline-flex items-center justify-center bg-white text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-transform hover:scale-105 shadow-xl hover:shadow-2xl hover:bg-gray-100"
            >
              {slides[currentSlide].buttonText}
            </Link>
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-8 flex gap-3 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white scale-150' : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
        </div>
      </div>

      {/* Add the keyframes for the marquee */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}

