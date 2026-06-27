import { NextResponse } from 'next/server';
import { verifyMagicToken, createSession, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '@/lib/auth';

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token') ?? '';

  if (!token) {
    return NextResponse.redirect(new URL('/?auth=invalid', req.url));
  }

  const email = await verifyMagicToken(token);
  if (!email) {
    return NextResponse.redirect(new URL('/?auth=expired', req.url));
  }

  const sessionId = await createSession(email);
  const origin = new URL(req.url).origin;
  const secure = process.env.NODE_ENV === 'production';

  const response = NextResponse.redirect(new URL('/profile', origin));
  response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  // Non-httpOnly indicator so the client can read the logged-in email
  response.cookies.set('tdb-user', email, {
    httpOnly: false,
    secure,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return response;
}
