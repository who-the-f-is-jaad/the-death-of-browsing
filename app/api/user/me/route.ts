import { getSession, getUserById, updateUser } from '@/lib/auth';
import { claimUsername, releaseUsername, isValidUsername } from '@/lib/social';
import { getUserCoins } from '@/lib/db';
import type { Portrait } from '@/lib/auth';

const VALID_PORTRAITS: Portrait[] = ['red', 'blue', 'green', 'yellow'];

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ email: null, username: null, portrait: null, coins: null });
  const [user, coins] = await Promise.all([
    getUserById(session.userId),
    getUserCoins(session.userId),
  ]);
  return Response.json({
    email: session.email,
    username: user?.username ?? null,
    portrait: user?.portrait ?? null,
    coins,
  });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json() as { username?: string; portrait?: string };
  const { username, portrait } = body;

  // Portrait-only update
  if (portrait !== undefined && !username) {
    if (!VALID_PORTRAITS.includes(portrait as Portrait)) {
      return Response.json({ error: 'Invalid portrait' }, { status: 400 });
    }
    const updated = await updateUser(session.email, { portrait: portrait as Portrait });
    return Response.json({ ok: true, portrait: updated?.portrait });
  }

  // Username (+ optional portrait) update
  if (!username) return Response.json({ error: 'username is required' }, { status: 400 });

  const handle = username.trim().toLowerCase();
  if (!isValidUsername(handle)) {
    return Response.json(
      { error: 'Username must be 3–20 characters: letters, numbers, underscores only.' },
      { status: 400 },
    );
  }

  const user = await getUserById(session.userId);
  const oldHandle = user?.username;

  if (oldHandle !== handle) {
    const claimed = await claimUsername(session.userId, handle);
    if (!claimed) return Response.json({ error: 'Username is already taken.' }, { status: 409 });
    if (oldHandle) await releaseUsername(oldHandle, session.userId);
  }

  const updates: Parameters<typeof updateUser>[1] = { username: handle };
  if (portrait && VALID_PORTRAITS.includes(portrait as Portrait)) {
    updates.portrait = portrait as Portrait;
  }

  const updated = await updateUser(session.email, updates);
  return Response.json({ ok: true, username: updated?.username, portrait: updated?.portrait });
}
