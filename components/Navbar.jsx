'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCart } from './CartContext';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Catalog' },
  // { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { totalItems, setIsCartDrawerOpen } = useCart();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setMenuOpen(false);
    setSearchOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-foreground text-background text-xs text-center py-2 px-4 uppercase tracking-widest font-semibold">
        Hurry Up Don't Move
      </div>

      {/* Main Nav */}
      <nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-background shadow-md' : 'bg-background'} border-b border-border/20`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">

            {/* Mobile Menu Button & Mobile Search */}
            <div className="flex items-center gap-4 lg:hidden">
              <button
                className="p-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMenuOpen(true)}
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
              </button>
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-foreground">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </div>

            {/* Left: Logo & Desktop Links */}
            <div className="flex flex-1 items-center justify-center lg:justify-start gap-8">
              <Link href="/" className="flex items-center flex-shrink-0">
                <span className="text-2xl font-bold tracking-tight text-foreground uppercase">WigZ</span>
              </Link>

              <div className="hidden lg:flex items-center gap-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-foreground hover:opacity-70 font-medium text-sm tracking-wide transition-opacity py-2"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-3 lg:gap-5">


              {/* Desktop Search */}
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="hidden lg:block p-2 text-foreground hover:opacity-70 transition-opacity"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>

              {/* User Account */}
              <Link href="/admin/login" className="hidden lg:block p-2 text-foreground hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative p-2 text-foreground hover:opacity-70 transition-opacity flex items-center gap-2"
                aria-label="Open Cart"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Dropdown */}
        {searchOpen && (
          <div className="border-t border-border/20 bg-background absolute w-full left-0">
            <div className="max-w-3xl mx-auto px-4 py-6">
              <form onSubmit={handleSearch} className="relative flex items-center border-b-2 border-foreground pb-2">
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent text-xl text-foreground placeholder-muted outline-none"
                />
                <button type="submit" className="text-foreground p-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[999] lg:hidden flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="relative w-4/5 max-w-sm bg-background h-full animate-in slide-in-from-left">
            <div className="flex items-center justify-between p-4 border-b border-border/20">
              <span className="text-xl font-bold uppercase">Menu</span>
              <button onClick={() => setMenuOpen(false)} className="p-2 text-foreground">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-lg font-medium py-2 border-b border-border/10"
                >
                  {link.label}
                </Link>
              ))}

            </div>
          </div>
        </div>
      )}
    </>
  );
}

