import { kv } from '@vercel/kv';
import { getCurrentDayKey } from '@/lib/resetTime';

export async function POST() {
  const date = getCurrentDayKey();
  try {
    const plays = await kv.incr(`tdb:plays:${date}`);
    return Response.json({ plays });
  } catch {
    return Response.json({ plays: 0 });
  }
}
