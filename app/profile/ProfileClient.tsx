'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import UsernameSetupModal from '@/components/ui/UsernameSetupModal';
import type { PublicStats, SoloBest } from '@/lib/db';
import type { Portrait } from '@/lib/auth';

const PORTRAITS: Portrait[] = ['red', 'blue', 'green', 'yellow'];

interface Props {
  email: string;
  username?: string;
  portrait?: Portrait;
  stats: PublicStats;
  friendCount?: number;
  bestSolo: SoloBest | null;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1rem' }}>
      {children}
    </p>
  );
}

function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
        <span style={{ fontSize: '1.05rem', color: '#ffffff' }}>{value}</span>
        {sub && <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{sub}</span>}
      </span>
    </div>
  );
}

function DecadeBar({ decade, played, solved }: { decade: number; played: number; solved: number }) {
  const rate = played > 0 ? solved / played : 0;
  const label = `${decade % 100 === 0 ? decade : String(decade).slice(-2)}s`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.3rem 0' }}>
      <span className="font-heading" style={{ fontSize: '0.6rem', letterSpacing: '0.08em', color: 'var(--text-dim)', width: '1.8rem', flexShrink: 0, textAlign: 'right' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '3px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden' }}>
        <div style={{ width: `${rate * 100}%`, height: '100%', background: rate >= 0.8 ? 'var(--text)' : rate >= 0.5 ? 'var(--text-mid)' : '#5a1a1a', transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: '0.875rem', color: '#ffffff', width: '2.5rem', textAlign: 'right', flexShrink: 0 }}>
        {Math.round(rate * 100)}%
      </span>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', width: '3rem', textAlign: 'right', flexShrink: 0 }}>
        {solved}/{played}
      </span>
    </div>
  );
}

export default function ProfileClient({ email, username: initialUsername, portrait: initialPortrait, stats, friendCount = 0, bestSolo }: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [portrait, setPortrait] = useState<Portrait | undefined>(initialPortrait);
  const [savingPortrait, setSavingPortrait] = useState(false);
  const [showSetup, setShowSetup] = useState(!initialUsername);

  const { streak, totalPlayed, totalSolved, winRate, decadeStats } = stats;

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

        {/* Performance */}
        {totalPlayed > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <SectionLabel>Performance</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <StatRow label="Win rate" value={`${winRate}%`} sub={`${totalSolved} of ${totalPlayed}`} />
              <StatRow label="Current streak" value={String(streak.current)} sub="days" />
              <StatRow label="Best streak" value={String(streak.longest)} sub="days" />
            </div>
          </div>
        )}

        {/* Decade sensitivity */}
        {decadeStats.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <SectionLabel>Decade sensitivity</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
              {decadeStats.map(d => (
                <DecadeBar key={d.decade} {...d} />
              ))}
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '0.75rem' }}>
              Based on {decadeStats.reduce((s, d) => s + d.played, 0)} games
            </p>
          </div>
        )}

        {/* Solo Play best score */}
        {bestSolo && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <SectionLabel>Solo Play</SectionLabel>
            <StatRow label="Best session" value={String(bestSolo.score)} sub="/ 5000" />
          </div>
        )}

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
