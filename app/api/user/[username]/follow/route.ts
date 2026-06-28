import { getSession, getUserByUsername } from '@/lib/auth';
import { followUser, unfollowUser } from '@/lib/social';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const { username } = await params;
  const target = await getUserByUsername(username.toLowerCase());
  if (!target) return Response.json({ error: 'User not found' }, { status: 404 });
  if (target.id === session.userId) return Response.json({ error: 'Cannot follow yourself' }, { status: 400 });

  await followUser(session.userId, target.id);
  return Response.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const { username } = await params;
  const target = await getUserByUsername(username.toLowerCase());
  if (!target) return Response.json({ error: 'User not found' }, { status: 404 });

  await unfollowUser(session.userId, target.id);
  return Response.json({ ok: true });
}
