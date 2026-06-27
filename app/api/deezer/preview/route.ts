function isAllowedDeezerUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname.endsWith('dzcdn.net');
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url || !isAllowedDeezerUrl(url)) {
    return new Response('Invalid URL', { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        'Referer': 'https://www.deezer.com/',
        'User-Agent': 'Mozilla/5.0 (compatible)',
      },
    });

    if (!upstream.ok) {
      return new Response('Preview unavailable', { status: upstream.status });
    }

    const headers = new Headers();
    const ct = upstream.headers.get('Content-Type');
    if (ct) headers.set('Content-Type', ct);
    const cl = upstream.headers.get('Content-Length');
    if (cl) headers.set('Content-Length', cl);
    headers.set('Cache-Control', 'public, max-age=86400');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(upstream.body, { status: 200, headers });
  } catch {
    return new Response('Failed to fetch preview', { status: 502 });
  }
}
