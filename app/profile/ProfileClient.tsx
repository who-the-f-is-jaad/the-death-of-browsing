'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import UsernameSetupModal from '@/components/ui/UsernameSetupModal';
import type { StreakData } from '@/lib/types';
import type { GameResult } from '@/lib/db';
import type { Portrait } from '@/lib/auth';

const PORTRAITS: Portrait[] = ['red', 'blue', 'green', 'yellow'];

interface Props {
  email: string;
  streak?: StreakData;
  history?: GameResult[];
  username?: string;
  portrait?: Portrait;
  friendCount?: number;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[m - 1]} ${y}`;
}

export default function ProfileClient({ email, streak, history = [], username: initialUsername, portrait: initialPortrait, friendCount = 0 }: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [portrait, setPortrait] = useState<Portrait | undefined>(initialPortrait);
  const [savingPortrait, setSavingPortrait] = useState(false);
  const [showSetup, setShowSetup] = useState(!initialUsername);

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }, []);

  const handlePortraitSelect = async (p: Portrait) => {
    if (p === portrait || savingPortrait) return;
    setSavingPortrait(true);
    setPortrait(p);
    await fetch('/api/user/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portrait: p }),
    });
    setSavingPortrait(false);
  };

  return (
    <DeadBrowserShell>
      {showSetup && (
        <UsernameSetupModal
          onComplete={(u) => {
            setUsername(u);
            setShowSetup(false);
          }}
        />
      )}

      <div style={{ padding: '2rem 0 4rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>

        {/* Identity hero */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '0.5rem' }}>

          {/* Portrait picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {PORTRAITS.map(p => (
                <button
                  key={p}
                  onClick={() => handlePortraitSelect(p)}
                  disabled={savingPortrait}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: savingPortrait ? 'default' : 'pointer',
                    borderRadius: '4px',
                    outline: portrait === p ? '2px solid var(--text)' : '2px solid transparent',
                    outlineOffset: '3px',
                    opacity: savingPortrait && portrait !== p ? 0.5 : 1,
                    transition: 'outline-color 0.15s, opacity 0.15s',
                  }}
                  aria-label={`${p} portrait`}
                  aria-pressed={portrait === p}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/assets/portraits/portrait-${p}.png`}
                    alt={`${p} portrait`}
                    style={{ width: 64, height: 64, display: 'block', borderRadius: '3px', objectFit: 'cover' }}
                  />
                </button>
              ))}
            </div>
            <p className="font-heading" style={{ fontSize: '0.44rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              Choose your portrait
            </p>
          </div>

          {/* Name / handle */}
          {username ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {portrait && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`/assets/portraits/portrait-${portrait}.png`}
                    alt="Your portrait"
                    style={{ width: 48, height: 48, borderRadius: '3px', objectFit: 'cover', flexShrink: 0 }}
                  />
                )}
                <div>
                  <p style={{ fontSize: '2.2rem', color: '#ffffff', fontWeight: 400, lineHeight: 1.05 }}>
                    @{username}
                  </p>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                    {email}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link
                  href={`/u/${username}`}
                  className="font-heading"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none' }}
                >
                  Public profile →
                </Link>
                <Link
                  href="/friends"
                  className="font-heading"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none' }}
                >
                  Friends ({friendCount})
                </Link>
                <button
                  onClick={() => setShowSetup(true)}
                  className="font-heading"
                  style={{ fontSize: '0.74rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.55 }}
                >
                  Edit name
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                {email}
              </p>
              <button
                onClick={() => setShowSetup(true)}
                className="btn-ghost font-heading"
                style={{ fontSize: '0.76rem', letterSpacing: '0.16em', textTransform: 'uppercase', alignSelf: 'flex-start' }}
              >
                Claim your @handle →
              </button>
            </>
          )}
        </div>

        {/* Streak */}
        {streak && (streak.current > 0 || streak.longest > 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <p className="font-heading" style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              Streak
            </p>
            <div style={{ display: 'flex', gap: '3rem' }}>
              <div>
                <p style={{ fontSize: '3.5rem', color: '#ffffff', lineHeight: 1, letterSpacing: '-0.02em' }}>{streak.current}</p>
                <p className="font-heading" style={{ fontSize: '0.92rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.4rem' }}>Current</p>
              </div>
              <div>
                <p style={{ fontSize: '3.5rem', color: 'var(--text-mid)', lineHeight: 1, letterSpacing: '-0.02em' }}>{streak.longest}</p>
                <p className="font-heading" style={{ fontSize: '0.92rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.4rem' }}>Best</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent games */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <p className="font-heading" style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Recent Omens
          </p>
          {history.length === 0 ? (
            <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
              No games recorded yet.
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
                    padding: '0.75rem 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-mid)', fontStyle: 'italic' }}>
                    {formatDate(r.date)}
                  </span>
                  <span className="font-heading" style={{ fontSize: '0.84rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: r.solved ? 'var(--text)' : 'var(--crimson)' }}>
                    {r.solved
                      ? `✓ ${r.attempts} ${r.attempts === 1 ? 'try' : 'tries'}`
                      : '† failed'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sign out */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
          <button onClick={handleLogout} className="btn-ghost" style={{ width: '100%' }}>
            Sign out
          </button>
        </div>

      </div>

      <footer style={{ borderTop: '1px solid var(--border-mid)', padding: '1.25rem 0', textAlign: 'center' }}>
        <Link
          href="/"
          className="font-heading"
          style={{ fontSize: '0.84rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none' }}
        >
          Exit to menu
        </Link>
      </footer>
    </DeadBrowserShell>
  );
}
