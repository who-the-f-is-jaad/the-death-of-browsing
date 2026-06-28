'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import UsernameSetupModal from '@/components/ui/UsernameSetupModal';
import type { StreakData } from '@/lib/types';
import type { GameResult } from '@/lib/db';

interface Props {
  email: string;
  streak?: StreakData;
  history?: GameResult[];
  username?: string;
  displayName?: string;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[m - 1]} ${y}`;
}

export default function ProfileClient({ email, streak, history = [], username: initialUsername, displayName: initialDisplayName }: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [showSetup, setShowSetup] = useState(!initialUsername);

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }, []);

  return (
    <DeadBrowserShell>
      <div style={{ padding: '2rem 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <p className="font-heading" style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          THE DEATH OF BROWSING
        </p>
        <p className="font-heading" style={{ fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)' }}>
          Profile
        </p>
      </div>

      <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
        {showSetup && (
          <UsernameSetupModal
            onComplete={(u, d) => {
              setUsername(u);
              setDisplayName(d);
              setShowSetup(false);
            }}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingTop: '0.5rem' }}>
          <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Signed in as
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', fontStyle: 'italic' }}>{email}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {username ? (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <p style={{ fontSize: '1.3rem', color: '#ffffff', letterSpacing: '0.02em' }}>
                  {displayName ?? username}
                </p>
                <span className="font-heading" style={{ fontSize: '0.48rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  @{username}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link
                  href={`/u/${username}`}
                  className="font-heading"
                  style={{ fontSize: '0.48rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none' }}
                >
                  View public profile →
                </Link>
                <button
                  onClick={() => setShowSetup(true)}
                  className="font-heading"
                  style={{ fontSize: '0.44rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.6 }}
                >
                  Edit handle
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowSetup(true)}
              className="btn-ghost font-heading"
              style={{ fontSize: '0.48rem', letterSpacing: '0.16em', textTransform: 'uppercase', alignSelf: 'flex-start' }}
            >
              Claim your @handle →
            </button>
          )}
        </div>

        {streak && (streak.current > 0 || streak.longest > 0) && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              Streak
            </p>
            <div style={{ display: 'flex', gap: '2.5rem' }}>
              <div>
                <p style={{ fontSize: '2.2rem', letterSpacing: '0.05em', color: 'var(--text)', lineHeight: 1 }}>{streak.current}</p>
                <p className="font-heading" style={{ fontSize: '0.45rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.35rem' }}>Current</p>
              </div>
              <div>
                <p style={{ fontSize: '2.2rem', letterSpacing: '0.05em', color: 'var(--text)', lineHeight: 1 }}>{streak.longest}</p>
                <p className="font-heading" style={{ fontSize: '0.45rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.35rem' }}>Longest</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Recent Omens
          </p>
          {history.length === 0 ? (
            <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
              No games recorded yet. Play today&apos;s omen to start.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {history.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.6rem 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span className="font-heading" style={{ fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>
                    {formatDate(r.date)}
                  </span>
                  <span className="font-heading" style={{ fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: r.solved ? 'var(--text)' : 'var(--crimson)' }}>
                    {r.solved
                      ? `✓ ${r.attempts} ${r.attempts === 1 ? 'try' : 'tries'}`
                      : '† failed'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ paddingTop: '0.5rem' }}>
          <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%' }}>
            Sign out
          </button>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--border-mid)', padding: '1.25rem 0', textAlign: 'center' }}>
        <Link
          href="/"
          className="font-heading"
          style={{ fontSize: '0.52rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none' }}
        >
          Back to today&apos;s omen
        </Link>
      </footer>
    </DeadBrowserShell>
  );
}
