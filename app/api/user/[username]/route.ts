import { getUserByUsername } from '@/lib/auth';
import { getUserPublicStats } from '@/lib/db';
import { getFollowerCount, getFollowingCount } from '@/lib/social';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const handle = username.toLowerCase();

  const user = await getUserByUsername(handle);
  if (!user || !user.username) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const [stats, followerCount, followingCount] = await Promise.all([
    getUserPublicStats(user.id),
    getFollowerCount(user.id),
    getFollowingCount(user.id),
  ]);

  return Response.json({
    userId: user.id,
    username: user.username,
    displayName: user.displayName ?? user.username,
    ...stats,
    followerCount,
    followingCount,
  });
}
