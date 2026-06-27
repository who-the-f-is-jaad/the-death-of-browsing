import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const res = await fetch(`https://api.deezer.com/album/${id}`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Deezer album fetch failed' }, { status: 502 });
  }
}
