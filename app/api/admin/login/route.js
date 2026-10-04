import { NextResponse } from 'next/server';

export async function POST(req) {
  const { password } = await req.json();
  const secret = process.env.ADMIN_API_SECRET;
  const superSecret = process.env.SUPER_ADMIN_API_SECRET;

  let matchedSecret = null;
  if (superSecret && password === superSecret) {
    matchedSecret = superSecret;
  } else if (secret && password === secret) {
    matchedSecret = secret;
  }

  if (!matchedSecret) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', matchedSecret, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', '', { path: '/', maxAge: 0 });
  return res;
}
