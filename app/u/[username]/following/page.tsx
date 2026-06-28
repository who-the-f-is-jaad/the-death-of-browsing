import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getUserByUsername, getUserById } from '@/lib/auth';
import { getFollowing } from '@/lib/social';

export default async function FollowingPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username.toLowerCase());
  if (!user || !user.username) notFound();

  const ids = await getFollowing(user.id, 50);
  const users = await Promise.all(ids.map(id => getUserById(id)));

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1.25rem 4rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
      <Link
        href={`/u/${user.username}`}
        className="font-heading"
        style={{ fontSize: '0.48rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}
      >
        ← @{user.username}
      </Link>
      <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
        Following
      </p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {users.filter(u => u?.username).map(u => (
          <Link
            key={u!.id}
            href={`/u/${u!.username}`}
            style={{ display: 'flex', flexDirection: 'column', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}
          >
            <span style={{ fontSize: '1rem', color: '#ffffff' }}>{u!.username}</span>
            <span className="font-heading" style={{ fontSize: '0.45rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.2rem' }}>@{u!.username}</span>
          </Link>
        ))}
        {users.filter(u => u?.username).length === 0 && (
          <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Not following anyone yet.</p>
        )}
      </div>
    </div>
  );
}
