'use client';

import Link from 'next/link';
import FollowButton from '@/components/ui/FollowButton';
import type { DayCell, PublicStats } from '@/lib/db';

interface Props {
  username: string;
  displayName: string;
  stats: PublicStats;
  followerCount: number;
  followingCount: number;
  viewerIsFollowing: boolean;
  isOwnProfile: boolean;
}

function DayGrid({ grid }: { grid: DayCell[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {grid.map(cell => (
        <div
          key={cell.date}
          title={cell.date}
          style={{
            width: 20,
            height: 20,
            borderRadius: 3,
            background: !cell.played
              ? 'var(--border)'
              : cell.solved
              ? 'var(--text)'
              : '#5a1a1a',
            opacity: !cell.played ? 0.35 : 1,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

export default function PublicProfileClient({
  username,
  displayName,
  stats,
  followerCount,
  followingCount,
  viewerIsFollowing,
  isOwnProfile,
}: Props) {
  const { streak, winRate, totalPlayed, totalSolved, grid } = stats;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1.25rem 4rem', display: 'flex', flexDirection: 'column', gap: '0' }}>

      <Link
        href="/"
        className="font-heading"
        style={{ fontSize: '0.48rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none', display: 'block', marginBottom: '2.5rem' }}
      >
        ← The Death of Browsing
      </Link>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Identity */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '1.75rem', color: '#ffffff', fontWeight: 400, lineHeight: 1.1, marginBottom: '0.2rem' }}>
              {displayName}
            </p>
            <p className="font-heading" style={{ fontSize: '0.52rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              @{username}
            </p>
          </div>
          {!isOwnProfile && (
            <FollowButton username={username} initialFollowing={viewerIsFollowing} />
          )}
          {isOwnProfile && (
            <Link
              href="/profile"
              className="font-heading"
              style={{ fontSize: '0.48rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none', borderBottom: '1px solid var(--border-mid)', paddingBottom: '1px' }}
            >
              Edit profile
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <div>
            <p style={{ fontSize: '1.75rem', color: '#ffffff', lineHeight: 1 }}>{streak.current}</p>
            <p className="font-heading" style={{ fontSize: '0.42rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Streak</p>
          </div>
          <div>
            <p style={{ fontSize: '1.75rem', color: '#ffffff', lineHeight: 1 }}>{streak.longest}</p>
            <p className="font-heading" style={{ fontSize: '0.42rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Best</p>
          </div>
          <div>
            <p style={{ fontSize: '1.75rem', color: '#ffffff', lineHeight: 1 }}>{winRate}<span style={{ fontSize: '1rem' }}>%</span></p>
            <p className="font-heading" style={{ fontSize: '0.42rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Solved</p>
          </div>
          <div>
            <p style={{ fontSize: '1.75rem', color: '#ffffff', lineHeight: 1 }}>{totalPlayed}</p>
            <p className="font-heading" style={{ fontSize: '0.42rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Played</p>
          </div>
        </div>

        {/* 30-day grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <p className="font-heading" style={{ fontSize: '0.48rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Last 30 days
          </p>
          <DayGrid grid={grid} />
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--text)', display: 'inline-block' }} />
              <span className="font-heading" style={{ fontSize: '0.38rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>solved</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: '#5a1a1a', display: 'inline-block' }} />
              <span className="font-heading" style={{ fontSize: '0.38rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>failed</span>
            </span>
          </div>
        </div>

        {/* Followers / Following */}
        <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
          <Link href={`/u/${username}/followers`} style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: '1.1rem', color: '#ffffff', lineHeight: 1 }}>{followerCount}</p>
            <p className="font-heading" style={{ fontSize: '0.42rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Followers</p>
          </Link>
          <Link href={`/u/${username}/following`} style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: '1.1rem', color: '#ffffff', lineHeight: 1 }}>{followingCount}</p>
            <p className="font-heading" style={{ fontSize: '0.42rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Following</p>
          </Link>
        </div>

        {totalPlayed === 0 && (
          <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>
            No games played yet.
          </p>
        )}

      </div>
    </div>
  );
}
