import { NextResponse } from 'next/server';

// Gates everything under /admin (pages) and /api/admin (mutation routes) behind
// a single shared-secret cookie set by /admin/login. This is a small single-operator
// store, not a multi-user system, so one admin secret is enough.
export function proxy(req) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === '/admin/login';
  const isLoginApi = pathname === '/api/admin/login';
  if (isLoginPage || isLoginApi) return NextResponse.next();

  const session = req.cookies.get('admin_session')?.value;
  const headerSecret = req.headers.get('x-admin-secret');
  const secret = process.env.ADMIN_API_SECRET;
  const superSecret = process.env.SUPER_ADMIN_API_SECRET;

  const isStandardAdmin = Boolean(secret) && (session === secret || headerSecret === secret);
  const isSuperAdmin = Boolean(superSecret) && (session === superSecret || headerSecret === superSecret);
  const authorized = isStandardAdmin || isSuperAdmin;

  if (pathname.startsWith('/api/admin')) {
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    if (!authorized) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
