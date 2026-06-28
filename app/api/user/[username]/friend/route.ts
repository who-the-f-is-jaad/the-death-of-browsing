import { getSession, getUserByUsername } from '@/lib/auth';
import {
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  unfriend,
} from '@/lib/social';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const { username } = await params;
  const target = await getUserByUsername(username.toLowerCase());
  if (!target) return Response.json({ error: 'User not found' }, { status: 404 });

  const result = await sendFriendRequest(session.userId, target.id);
  if (result === 'self') return Response.json({ error: 'Cannot friend yourself' }, { status: 400 });
  if (result === 'already_friends') return Response.json({ error: 'Already friends' }, { status: 409 });
  if (result === 'already_sent') return Response.json({ error: 'Request already sent' }, { status: 409 });
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

  // Handles both cancel-request and unfriend in one call
  await Promise.all([
    cancelFriendRequest(session.userId, target.id),
    unfriend(session.userId, target.id),
  ]);
  return Response.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const { username } = await params;
  const target = await getUserByUsername(username.toLowerCase());
  if (!target) return Response.json({ error: 'User not found' }, { status: 404 });

  const { action } = await req.json() as { action: string };
  if (action === 'accept') {
    await acceptFriendRequest(session.userId, target.id);
    return Response.json({ ok: true });
  }
  if (action === 'reject') {
    await rejectFriendRequest(session.userId, target.id);
    return Response.json({ ok: true });
  }
  return Response.json({ error: 'Invalid action' }, { status: 400 });
}
