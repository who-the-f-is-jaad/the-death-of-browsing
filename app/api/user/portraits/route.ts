import { getSession } from '@/lib/auth';
import { getUnlockedPortraits, unlockPortrait, getUserCoins } from '@/lib/db';
import { PORTRAIT_DEFS, FREE_PORTRAIT_IDS } from '@/lib/portraitConfig';

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const [paid, coins] = await Promise.all([
    getUnlockedPortraits(session.userId),
    getUserCoins(session.userId),
  ]);

  return Response.json({
    unlocked: [...FREE_PORTRAIT_IDS, ...paid],
    coins,
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { portrait } = body as { portrait?: string };

  const def = PORTRAIT_DEFS.find(p => p.id === portrait);
  if (!def) return Response.json({ error: 'Invalid portrait' }, { status: 400 });
  if (def.free) return Response.json({ error: 'Portrait is already free' }, { status: 400 });

  const result = await unlockPortrait(session.userId, def.id, def.price!);

  if (result === 'insufficient_coins') {
    return Response.json({ error: 'Not enough coins' }, { status: 402 });
  }
  if (result === 'already_unlocked') {
    return Response.json({ error: 'Already unlocked' }, { status: 409 });
  }

  const coins = await getUserCoins(session.userId);
  return Response.json({ ok: true, coins });
}
