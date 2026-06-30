import { getSession } from '@/lib/auth';
import { saveSoloScore, addPoints, recordSoloRound } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ ok: true }); // silently ignore if not authed

  const body = await req.json().catch(() => ({}));
  const { score, rounds } = body;

  if (typeof score !== 'number' || score < 0 || score > 5000) {
    return Response.json({ error: 'Invalid score' }, { status: 400 });
  }

  const ops: Promise<unknown>[] = [
    saveSoloScore(session.userId, score),
    addPoints(session.userId, score),
  ];

  // Record each round individually so they appear in profile stats + decade chart
  if (Array.isArray(rounds)) {
    for (const r of rounds) {
      if (typeof r.answerYear === 'number' && typeof r.score === 'number') {
        ops.push(recordSoloRound(session.userId, r.answerYear, r.score));
      }
    }
  }

  await Promise.all(ops);
  return Response.json({ ok: true });
}
