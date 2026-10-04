'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return <p className="text-primary font-medium">You&apos;re subscribed. Thanks for joining!</p>;
  }

  return (
    <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubmit}>
      <input
        type="email"
        required
        placeholder="you@example.com"
        className="flex-grow bg-surface border border-border text-foreground placeholder-muted rounded-full shadow-sm focus:ring-2 focus:ring-primary focus:border-primary px-5 py-3 outline-none"
      />
      <button type="submit" className="bg-primary hover:bg-primary-dark text-primary-foreground font-semibold px-6 py-3 rounded-full transition-colors whitespace-nowrap">
        Subscribe
      </button>
    </form>
  );
}

