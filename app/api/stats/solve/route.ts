import { kv } from '@vercel/kv';
import { getCurrentDayKey } from '@/lib/resetTime';

export async function POST() {
  const date = getCurrentDayKey();
  try {
    const solves = await kv.incr(`tdb:solves:${date}`);
    return Response.json({ solves });
  } catch {
    return Response.json({ solves: 0 });
  }
}
