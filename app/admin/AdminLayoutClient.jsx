'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

const NAV_SECTIONS = [
  {
    label: 'Overview',
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
        superAdminOnly: true,
        icon: (props) => (
          <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
        ),
      },
    ],
  },
  {
    label: 'Inventory & Catalog',
    items: [
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

function getFilteredNavSections(role) {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (item.superAdminOnly && role !== 'superadmin') return false;
      return true;
    }),
  }));
}

function isActive(pathname, href, exact) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

export default function AdminLayoutClient({ children, role }) {
  const filteredNavSections = getFilteredNavSections(role);
  const pathname = usePathname();
  const router = useRouter();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Close drawer on pathname change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Handle escape key and body scroll lock for mobile drawer
  useEffect(() => {
    if (mobileDrawerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setMobileDrawerOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileDrawerOpen]);

  if (pathname === '/admin/login') {
    return children;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  // Mobile bottom navigation quick links
  const mobileBottomTabs = [
    {
      href: '/admin',
      label: 'Home',
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
      href: '/admin/products',
      label: 'Products',
      exact: true,
      icon: (props) => (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
      ),
    },
    ...(role === 'superadmin'
      ? [
          {
            href: '/admin/billing',
            label: 'Billing',
            icon: (props) => (
              <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            ),
          },
        ]
      : [
          {
            href: '/admin/discounts',
            label: 'Discounts',
            icon: (props) => (
              <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            ),
          },
        ]),
  ];

  return (
    <div className="admin-theme min-h-screen bg-subtle flex text-foreground antialiased">
      {/* ============================================================ */}
      {/* 1. DESKTOP SIDEBAR                                          */}
      {/* ============================================================ */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col bg-surface border-r border-border shadow-sm">
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <div className="leading-tight">
              <span className="text-base font-extrabold text-foreground tracking-tight block">Velloura Collective</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {role === 'superadmin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          </div>
          <span
            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
              role === 'superadmin'
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
            }`}
          >
            {role === 'superadmin' ? 'Super' : 'Staff'}
          </span>
        </div>

        <nav className="flex-grow py-4 px-3 space-y-6 overflow-y-auto">
          {filteredNavSections.map((section, sIdx) => (
            <div key={sIdx}>
              {section.label && (
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted/70">
                  {section.label}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                          : 'text-muted hover:text-foreground hover:bg-elevated'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-elevated transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            View Store
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MOBILE SLIDE-OVER DRAWER & BACKDROP                      */}
      {/* ============================================================ */}
      {mobileDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-surface border-r border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-surface">
          <div className="flex items-center gap-2.5 min-w-0">
            <Logo size={28} className="flex-shrink-0" />
            <div className="leading-tight">
              <div className="flex flex-col leading-none">
                <span className="text-sm font-extrabold text-foreground tracking-tight uppercase">Velloura</span>
                <span className="text-[9px] font-semibold text-muted tracking-widest uppercase mt-0.5">Collective</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-primary mt-1 block">
                {role === 'superadmin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-elevated transition-colors"
            aria-label="Close navigation menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer Scrollable Navigation */}
        <nav className="flex-grow py-4 px-3 space-y-6 overflow-y-auto">
          {filteredNavSections.map((section, sIdx) => (
            <div key={sIdx}>
              {section.label && (
                <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted/70">
                  {section.label}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                          : 'text-muted hover:text-foreground hover:bg-elevated'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Drawer Bottom Actions */}
        <div className="p-3 border-t border-border space-y-1 bg-surface">
          <Link
            href="/"
            onClick={() => setMobileDrawerOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-elevated transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            View Store
          </Link>
          <button
            type="button"
            onClick={() => {
              setMobileDrawerOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. MAIN CONTENT CONTAINER                                   */}
      {/* ============================================================ */}
      <div className="flex-grow min-w-0 flex flex-col pb-20 md:pb-6">
        {/* Mobile Sticky Header */}
        <header className="md:hidden sticky top-0 z-30 h-14 bg-surface/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1.5 -ml-1 rounded-lg text-foreground hover:bg-elevated transition-colors flex-shrink-0"
              aria-label="Open sidebar menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <Logo size={26} className="flex-shrink-0" />
              <div className="flex flex-col leading-none">
                <span className="text-xs font-black text-foreground tracking-tight uppercase">Velloura</span>
                <span className="text-[8px] font-semibold text-muted tracking-widest uppercase">Collective</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                role === 'superadmin'
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
              }`}
            >
              {role === 'superadmin' ? 'Super Admin' : 'Staff'}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow">{children}</main>
      </div>

      {/* ============================================================ */}
      {/* 4. MOBILE BOTTOM NAVIGATION BAR                              */}
      {/* ============================================================ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border px-1 py-1 flex items-center justify-around shadow-lg"
        aria-label="Mobile quick navigation"
      >
        {mobileBottomTabs.map((tab) => {
          const active = isActive(pathname, tab.href, tab.exact);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 text-[11px] font-medium transition-colors ${
                active ? 'text-primary font-bold' : 'text-muted hover:text-foreground'
              }`}
            >
              <tab.icon className={`w-5 h-5 mb-0.5 ${active ? 'text-primary' : 'text-muted'}`} />
              <span className="truncate max-w-[60px] text-center">{tab.label}</span>
            </Link>
          );
        })}

        {/* 5th Tab: Menu (triggers the slide-over drawer) */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 text-[11px] font-medium transition-colors ${
            mobileDrawerOpen ? 'text-primary font-bold' : 'text-muted hover:text-foreground'
          }`}
          aria-label="Open full menu"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
