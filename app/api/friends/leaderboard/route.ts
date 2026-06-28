import { getSession, getUserById } from '@/lib/auth';
import { getFriends } from '@/lib/social';
import { getUserPublicStats } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const friendIds = await getFriends(session.userId);
  const allIds = [session.userId, ...friendIds];

  const entries = await Promise.all(
    allIds.map(async (id) => {
      const [user, stats] = await Promise.all([getUserById(id), getUserPublicStats(id)]);
      if (!user?.username) return null;
      return {
        username: user.username!,
        portrait: user.portrait ?? null,
        streak: stats.streak.current,
        winRate: stats.winRate,
        totalPlayed: stats.totalPlayed,
        isSelf: id === session.userId,
      };
    }),
  );

  return Response.json(
    entries
      .filter(Boolean)
      .sort((a, b) => b!.streak - a!.streak || b!.winRate - a!.winRate),
  );
}
