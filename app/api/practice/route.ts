import { fetchMultiPool, samplePool } from '@/lib/songPool';
import { enrichFromDeezer } from '@/lib/omenDeezer';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const excludeParam = searchParams.get('exclude') ?? '';
  const excluded = new Set(excludeParam.split(',').filter(Boolean));

  let pool;
  try {
    pool = await fetchMultiPool();
  } catch {
    return Response.json({ entry: null }, { status: 502 });
  }

  const available = pool.filter(r => {
    const id = r.deezerTrackUrl.split('/').pop() ?? '';
    return !excluded.has(id);
  });

  if (!available.length) {
    return Response.json({ entry: null, exhausted: true });
  }

  const [row] = samplePool(available, 1);
  const entry = await enrichFromDeezer(row.deezerTrackUrl, row.answerYear, 'practice');
  if (!entry) return Response.json({ entry: null });

  const trackId = entry.id.split(':').pop() ?? '';
  return Response.json({ entry, trackId });
}
