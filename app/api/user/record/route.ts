import { getSession } from '@/lib/auth';
import { recordResult } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { date, solved, attempts } = body;

  if (typeof date !== 'string' || typeof solved !== 'boolean' || typeof attempts !== 'number') {
    return Response.json({ error: 'Invalid payload' }, { status: 400 });
  }

  await recordResult(session.userId, date, solved, attempts);
  return Response.json({ ok: true });
}
