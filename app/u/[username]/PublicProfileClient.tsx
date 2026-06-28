'use client';

import Link from 'next/link';
import FollowButton from '@/components/ui/FollowButton';
import type { DayCell, PublicStats } from '@/lib/db';
import type { Portrait } from '@/lib/auth';

interface Props {
  username: string;
  portrait?: Portrait;
  stats: PublicStats;
  followerCount: number;
  followingCount: number;
  viewerIsFollowing: boolean;
  isOwnProfile: boolean;
}

function DayGrid({ grid }: { grid: DayCell[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
      {grid.map(cell => (
        <div
          key={cell.date}
          title={cell.date}
          style={{
            width: 22,
            height: 22,
            borderRadius: 3,
            background: !cell.played
              ? 'var(--border)'
              : cell.solved
              ? 'var(--text)'
              : '#5a1a1a',
            opacity: !cell.played ? 0.3 : 1,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

export default function PublicProfileClient({
  username,
  portrait,
  stats,
  followerCount,
  followingCount,
  viewerIsFollowing,
  isOwnProfile,
}: Props) {
  const { streak, winRate, totalPlayed, grid } = stats;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1.25rem 5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>

      {/* Back link */}
      <Link
        href="/"
        className="font-heading"
        style={{ fontSize: '0.48rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none' }}
      >
        ← The Death of Browsing
      </Link>

      {/* Identity block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {portrait && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/assets/portraits/portrait-${portrait}.png`}
              alt={`${username}'s portrait`}
              style={{ width: 64, height: 64, borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          <div>
            <p style={{ fontSize: '2.6rem', color: '#ffffff', fontWeight: 400, lineHeight: 1.05, marginBottom: '0.35rem' }}>
              @{username}
            </p>
          </div>
        </div>

        {/* Social counts + action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href={`/u/${username}/followers`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <span style={{ fontSize: '1.1rem', color: '#ffffff', lineHeight: 1 }}>{followerCount}</span>
            <span className="font-heading" style={{ fontSize: '0.42rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>followers</span>
          </Link>
          <Link href={`/u/${username}/following`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <span style={{ fontSize: '1.1rem', color: '#ffffff', lineHeight: 1 }}>{followingCount}</span>
            <span className="font-heading" style={{ fontSize: '0.42rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>following</span>
          </Link>
          {!isOwnProfile && (
            <div style={{ marginLeft: 'auto' }}>
              <FollowButton username={username} initialFollowing={viewerIsFollowing} />
            </div>
          )}
          {isOwnProfile && (
            <Link
              href="/profile"
              className="font-heading"
              style={{ marginLeft: 'auto', fontSize: '0.46rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none' }}
            >
              Edit profile
            </Link>
          )}
        </div>
      </div>

      {/* Stats block */}
      {totalPlayed > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Hero stat: streak */}
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: '4rem', color: '#ffffff', lineHeight: 1, letterSpacing: '-0.02em' }}>{streak.current}</p>
              <p className="font-heading" style={{ fontSize: '0.44rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                {streak.current === 1 ? 'day streak' : 'day streak'}
              </p>
            </div>
            <div style={{ paddingBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <p style={{ fontSize: '1rem', color: 'var(--text-mid)' }}>
                Best <span style={{ color: '#ffffff' }}>{streak.longest}</span>
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--text-mid)' }}>
                Solved <span style={{ color: '#ffffff' }}>{winRate}%</span>
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--text-mid)' }}>
                Played <span style={{ color: '#ffffff' }}>{totalPlayed}</span>
              </p>
            </div>
          </div>

          {/* 30-day grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p className="font-heading" style={{ fontSize: '0.46rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              Last 30 days
            </p>
            <DayGrid grid={grid} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--text)', display: 'inline-block' }} />
                <span className="font-heading" style={{ fontSize: '0.38rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>solved</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: '#5a1a1a', display: 'inline-block' }} />
                <span className="font-heading" style={{ fontSize: '0.38rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>failed</span>
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>
          No games played yet.
        </p>
      )}

    </div>
  );
}
