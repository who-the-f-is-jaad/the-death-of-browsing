import { getUserById } from '@/lib/auth';
import { searchUsersByPrefix } from '@/lib/social';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim().toLowerCase();

  if (q.length < 1) return Response.json({ results: [] });

  const matches = await searchUsersByPrefix(q, 10);

  const results = await Promise.all(
    matches.map(async ({ username, userId }) => {
      const user = await getUserById(userId);
      return { username, displayName: user?.displayName ?? username };
    }),
  );

  return Response.json({ results });
}
