import { getSession, getUserById } from '@/lib/auth';
import { getIncomingRequests } from '@/lib/social';

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const ids = await getIncomingRequests(session.userId);
  const users = await Promise.all(ids.map(id => getUserById(id)));
  return Response.json(
    users
      .filter((u): u is NonNullable<typeof u> => !!u && !!u.username)
      .map(u => ({ username: u.username!, portrait: u.portrait ?? null })),
  );
}
