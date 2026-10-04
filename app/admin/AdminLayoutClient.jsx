'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

const NAV_SECTIONS = [
  {
    label: null, // No section label for the main group
    items: [
      {
        href: '/admin',
        label: 'Dashboard',
        exact: true,
        icon: (props) => (
          <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        ),
      },
      {
        href: '/admin/orders',
        label: 'Orders',
        icon: (props) => (
          <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        ),
      },
      {
        href: '/admin/billing',
        label: 'Billing Data',
        icon: (props) => (
          <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
        ),
      },
      {
        href: '/admin/products',
        label: 'Products',
        exact: true,
        icon: (props) => (
          <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
        ),
      },
      {
        href: '/admin/products/new',
        label: 'Add Product',
        icon: (props) => (
          <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        ),
      },
      {
        href: '/admin/products/import-cj',
        label: 'Import from CJ',
        icon: (props) => (
          <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        ),
      },
      {
        href: '/admin/discounts',
        label: 'Discounts',
        icon: (props) => (
          <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
        ),
      },
    ],
  },
];

// Flat list for mobile menu helper
function getFilteredNavSections(role) {
  return NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // Only superadmin can see Billing Data
      if (item.label === 'Billing Data' && role !== 'superadmin') return false;
      return true;
    })
  }));
}

function isActive(pathname, href, exact) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

export default function AdminLayoutClient({ children, role }) {
  const filteredNavSections = getFilteredNavSections(role);
  const mobileItems = filteredNavSections.flatMap(s => s.items);

  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname === '/admin/login') {
    return children;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-subtle flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col bg-surface border-r border-border">
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-border">
          <Logo size={48} />
          <span className="text-lg font-extrabold text-foreground">WigVella<span className="text-muted font-normal text-sm ml-1">Admin</span></span>
        </div>
        <nav className="flex-grow py-4 px-3 space-y-6">
          {filteredNavSections.map((section, sIdx) => (
            <div key={sIdx}>
              {section.label && (
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted/60">{section.label}</div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-foreground hover:bg-elevated'
                        }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-primary hover:bg-elevated transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            View Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-danger hover:bg-elevated transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-grow min-w-0 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex flex-col border-b border-border bg-surface sticky top-0 z-50">
          <div className="h-14 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Logo size={40} />
              <span className="text-sm font-extrabold text-foreground">WigVella Admin</span>
            </div>
            <button
              className="p-2 text-foreground focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
              )}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="px-4 py-3 bg-surface border-t border-border flex flex-col gap-1">
              {mobileItems.map(item => {
                const active = isActive(pathname, item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2.5 px-3 rounded-lg text-sm font-medium ${active ? 'bg-primary/10 text-primary' : 'text-muted'
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-border mt-1 pt-2 flex flex-col gap-1">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-2.5 px-3 rounded-lg text-sm text-muted">View Store</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-left py-2.5 px-3 rounded-lg text-sm text-danger font-medium">Log Out</button>
              </div>
            </div>
          )}
        </div>
        <div className="flex-grow">{children}</div>
      </div>
    </div>
  );
}

