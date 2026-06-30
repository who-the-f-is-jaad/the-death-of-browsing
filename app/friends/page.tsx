import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession, getUserById } from '@/lib/auth';
import { getFriends, getIncomingRequests } from '@/lib/social';
import { getUserHistory, getUserPublicStats, getUserCoins } from '@/lib/db';
import RequestList from './RequestList';

export const metadata: Metadata = { title: 'Friends — THE DEATH OF BROWSING' };

function formatDate(d: string) {
  const [, m, day] = d.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[m - 1]}`;
}

const sectionLabel: React.CSSProperties = {
  fontSize: '0.78rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-mid)',
  fontFamily: "'IM Fell DW Pica SC', Georgia, serif",
};

export default async function FriendsPage() {
  const session = await getSession();
  if (!session) redirect('/profile');

  const [requestIds, friendIds] = await Promise.all([
    getIncomingRequests(session.userId),
    getFriends(session.userId),
  ]);

  const [requestUsers, friendUsers] = await Promise.all([
    Promise.all(requestIds.map(id => getUserById(id))),
    Promise.all(friendIds.map(id => getUserById(id))),
  ]);

  const requests = requestUsers
    .filter((u): u is NonNullable<typeof u> => !!u?.username)
    .map(u => ({ username: u.username!, portrait: u.portrait ?? null }));

  const validFriends = friendUsers.filter((u): u is NonNullable<typeof u> => !!u?.username);

  // Activity feed — last 3 results per friend
  const feedPerFriend = await Promise.all(
    validFriends.map(async u => {
      const history = await getUserHistory(u.id, 3);
      return history.map(r => ({
        username: u.username!,
        portrait: u.portrait ?? null,
        date: r.date,
        solved: r.solved,
        attempts: r.attempts,
      }));
    }),
  );
  const feed = feedPerFriend.flat().sort((a, b) => b.date.localeCompare(a.date));

  // Leaderboard — self + all friends, sorted by total coins (= total points earned)
  const leaderboardIds = [session.userId, ...friendIds];
  const leaderboardRaw = await Promise.all(
    leaderboardIds.map(async id => {
      const [user, stats, coins] = await Promise.all([
        getUserById(id),
        getUserPublicStats(id),
        getUserCoins(id),
      ]);
      if (!user?.username) return null;
      return {
        username: user.username!,
        portrait: user.portrait ?? null,
        coins,
        totalPlayed: stats.totalPlayed,
        isSelf: id === session.userId,
      };
    }),
  );
  const leaderboard = (leaderboardRaw.filter(Boolean) as NonNullable<typeof leaderboardRaw[0]>[])
    .sort((a, b) => b.coins - a.coins);

  return (
    <div style={{ width: '100%', maxWidth: '52rem', margin: '0 auto', padding: '1.75rem 1.5rem 5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>

      <Link
        href="/"
        className="font-heading"
        style={{ fontSize: '0.76rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-mid)', textDecoration: 'none' }}
      >
        ← The Death of Browsing
      </Link>

      {/* Incoming friend requests */}
      {requests.length > 0 && <RequestList requests={requests} />}

      {/* Activity feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={sectionLabel}>Activity</p>
        {feed.length === 0 ? (
          <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
            {friendIds.length === 0
              ? 'Add friends to see their activity here.'
              : 'No activity in the last few days.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {feed.map((entry, i) => (
              <div
                key={i}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: '1px solid var(--border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {entry.portrait && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/assets/portraits/portrait-${entry.portrait}.png`}
                      alt=""
                      style={{ width: 36, height: 36, borderRadius: '3px', objectFit: 'cover', flexShrink: 0 }}
                    />
                  )}
                  <div>
                    <Link href={`/u/${entry.username}`} style={{ textDecoration: 'none', color: '#ffffff', fontSize: '1rem' }}>
                      @{entry.username}
                    </Link>
                    <span className="font-heading" style={{ display: 'block', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-mid)', marginTop: '0.15rem' }}>
                      {formatDate(entry.date)}
                    </span>
                  </div>
                </div>
                <span className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: entry.solved ? 'var(--text)' : 'var(--crimson)' }}>
                  {entry.solved ? `✓ ${entry.attempts} ${entry.attempts === 1 ? 'try' : 'tries'}` : '† failed'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={sectionLabel}>Leaderboard · coins earned</p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {leaderboard.map((entry, i) => (
            <div
              key={entry.username}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.9rem 0.5rem',
                borderBottom: '1px solid var(--border)',
                background: entry.isSelf ? 'rgba(255,255,255,0.03)' : 'none',
              }}
            >
              <span style={{ fontSize: '1.1rem', color: 'var(--text-mid)', minWidth: '1.5rem', textAlign: 'right', flexShrink: 0 }}>
                {i + 1}
              </span>
              {entry.portrait ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/assets/portraits/portrait-${entry.portrait}.png`}
                  alt=""
                  style={{ width: 40, height: 40, borderRadius: '3px', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: '3px', background: 'var(--border)', flexShrink: 0 }} />
              )}
              <Link
                href={`/u/${entry.username}`}
                style={{ textDecoration: 'none', color: '#ffffff', fontSize: '1rem', flex: 1 }}
              >
                @{entry.username}
                {entry.isSelf && (
                  <span style={{ color: 'var(--text-mid)', fontSize: '0.8rem', marginLeft: '0.6rem' }}>you</span>
                )}
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/coin.png" alt="" width={15} height={15} style={{ opacity: 0.8 }} />
                <span style={{ fontSize: '1.15rem', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>{entry.coins.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
