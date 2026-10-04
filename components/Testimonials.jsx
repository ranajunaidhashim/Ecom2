import React from 'react';

const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    role: "Verified Buyer",
    content: "The shipping was incredibly fast, and the quality of the cosmetics exceeded my expectations. The packaging was also very secure. Will definitely be ordering again!",
    rating: 5,
    initial: "S"
  },
  {
    name: "Michael T.",
    role: "Verified Buyer",
    content: "I've struggled to find reliable dental care products online, but this store makes it so easy. The product descriptions are accurate and the checkout process is seamless.",
    rating: 5,
    initial: "M"
  },
  {
    name: "Elena R.",
    role: "Verified Buyer",
    content: "Bought some toys for my nephew's birthday. They arrived two days early and the customer service team was super helpful when I had a question about my order.",
    rating: 5,
    initial: "E"
  }
];

function StarRating({ rating }) {
  return (
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg 
          key={i} 
          className={`w-4 h-4 ${i < rating ? 'text-amber-400' : 'text-gray-300'}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Loved by Our Customers</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Don't just take our word for it. Here's what real shoppers have to say about their experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, idx) => (
            <div 
              key={idx} 
              className="bg-surface border border-border rounded-2xl p-8 shadow-sm flex flex-col relative"
            >
              {/* Decorative quote mark */}
              <div className="absolute top-6 right-8 text-6xl text-primary/10 font-serif leading-none">
                "
              </div>
              
              <StarRating rating={testimonial.rating} />
              
              <p className="text-muted mb-8 relative z-10 flex-grow leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                  {testimonial.initial}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-muted mt-0.5">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
