import { getSession } from '@/lib/auth';
import { saveSoloScore, addPoints } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ ok: true }); // silently ignore if not authed

  const body = await req.json().catch(() => ({}));
  const { score } = body;

  if (typeof score !== 'number' || score < 0 || score > 5000) {
    return Response.json({ error: 'Invalid score' }, { status: 400 });
  }

  await Promise.all([
    saveSoloScore(session.userId, score),
    addPoints(session.userId, score),
  ]);
  return Response.json({ ok: true });
}
