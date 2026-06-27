import { kv } from '@vercel/kv';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  if (!date) return Response.json({ plays: 0, solves: 0 });

  try {
    const [plays, solves] = await Promise.all([
      kv.get<number>(`tdb:plays:${date}`),
      kv.get<number>(`tdb:solves:${date}`),
    ]);
    return Response.json({ plays: plays ?? 0, solves: solves ?? 0 });
  } catch {
    return Response.json({ plays: 0, solves: 0 });
  }
}
