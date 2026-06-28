import { getSession, getUserById } from '@/lib/auth';
import { getFriends } from '@/lib/social';
import { getUserHistory } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const friendIds = await getFriends(session.userId);
  if (friendIds.length === 0) return Response.json([]);

  const perFriend = await Promise.all(
    friendIds.map(async (id) => {
      const [user, history] = await Promise.all([getUserById(id), getUserHistory(id, 3)]);
      if (!user?.username) return [];
      return history.map(r => ({
        username: user.username!,
        portrait: user.portrait ?? null,
        date: r.date,
        solved: r.solved,
        attempts: r.attempts,
      }));
    }),
  );

  return Response.json(
    perFriend.flat().sort((a, b) => b.date.localeCompare(a.date)),
  );
}
