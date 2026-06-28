import { getUserByUsername, getUserById } from '@/lib/auth';
import { getFollowing } from '@/lib/social';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const user = await getUserByUsername(username.toLowerCase());
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

  const followingIds = await getFollowing(user.id, 50);
  const following = await Promise.all(followingIds.map(id => getUserById(id)));

  return Response.json({
    following: following
      .filter((u): u is NonNullable<typeof u> => u !== null && !!u.username)
      .map(u => ({ username: u.username!, displayName: u.username! })),
  });
}
