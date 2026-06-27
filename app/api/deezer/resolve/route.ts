import { NextResponse } from 'next/server';

// Resolves a Deezer short link (link.deezer.com/s/...) to its final track URL
// by following server-side redirects, which bypass browser CORS restrictions.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'Missing url param' }, { status: 400 });

  try {
    const res = await fetch(url, { redirect: 'follow' });
    return NextResponse.json({ resolvedUrl: res.url });
  } catch {
    return NextResponse.json({ error: 'Failed to resolve URL' }, { status: 502 });
  }
}
