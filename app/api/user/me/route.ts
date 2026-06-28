import { getSession, getUserById, updateUser } from '@/lib/auth';
import { claimUsername, releaseUsername, isValidUsername } from '@/lib/social';

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ email: null, username: null, displayName: null });
  const user = await getUserById(session.userId);
  return Response.json({
    email: session.email,
    username: user?.username ?? null,
    displayName: user?.displayName ?? null,
  });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const body = await req.json() as { username?: string; displayName?: string };
  const { username, displayName } = body;

  if (!username) return Response.json({ error: 'username is required' }, { status: 400 });

  const handle = username.trim().toLowerCase();
  if (!isValidUsername(handle)) {
    return Response.json(
      { error: 'Username must be 3–20 characters: lowercase letters, numbers, underscores only.' },
      { status: 400 },
    );
  }

  const user = await getUserById(session.userId);
  const oldHandle = user?.username;

  // If changing to a different username, claim the new one
  if (oldHandle !== handle) {
    const claimed = await claimUsername(session.userId, handle);
    if (!claimed) return Response.json({ error: 'Username is already taken.' }, { status: 409 });
    // Release old handle if they had one
    if (oldHandle) await releaseUsername(oldHandle, session.userId);
  }

  const updated = await updateUser(session.email, {
    username: handle,
    displayName: displayName?.trim() || handle,
  });

  return Response.json({ ok: true, username: updated?.username, displayName: updated?.displayName });
}
