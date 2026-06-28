import { getUserByUsername, getUserById } from '@/lib/auth';
import { getFollowers } from '@/lib/social';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const user = await getUserByUsername(username.toLowerCase());
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

  const followerIds = await getFollowers(user.id, 50);
  const followers = await Promise.all(followerIds.map(id => getUserById(id)));

  return Response.json({
    followers: followers
      .filter((u): u is NonNullable<typeof u> => u !== null && !!u.username)
      .map(u => ({ username: u.username!, displayName: u.username! })),
  });
}
