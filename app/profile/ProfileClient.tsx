'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import UsernameSetupModal from '@/components/ui/UsernameSetupModal';
import type { PublicStats, DecadeStat, SoloBest } from '@/lib/db';
import type { Portrait } from '@/lib/auth';

const PORTRAITS: Portrait[] = ['red', 'blue', 'green', 'yellow'];

// All decades we always show, 60s → 20s
const ALL_DECADES = [1960, 1970, 1980, 1990, 2000, 2010, 2020];

interface Props {
  email: string;
  username?: string;
  portrait?: Portrait;
  stats: PublicStats;
  friendCount?: number;
  bestSolo: SoloBest | null;
}

function decadeLabel(d: number) {
  return d === 2000 ? '00s' : `${String(d).slice(-2)}s`;
}

function DecadeChart({ decadeStats }: { decadeStats: DecadeStat[] }) {
  const byDecade = new Map(decadeStats.map(d => [d.decade, d]));
  const maxPlayed = Math.max(...ALL_DECADES.map(d => byDecade.get(d)?.played ?? 0), 1);
  void maxPlayed;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
      {ALL_DECADES.map(decade => {
        const d = byDecade.get(decade);
        const played = d?.played ?? 0;
        const solved = d?.solved ?? 0;
        const rate = played > 0 ? solved / played : null;
        const barColor = rate === null
          ? 'var(--border)'
          : rate >= 0.8 ? 'var(--text)'
          : rate >= 0.5 ? 'var(--text-mid)'
          : '#5a1a1a';

        return (
          <div key={decade} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.28rem 0' }}>
            <span className="font-heading" style={{
              fontSize: '0.58rem', letterSpacing: '0.06em',
              color: played > 0 ? 'var(--text-dim)' : 'var(--border-hi)',
              width: '2rem', flexShrink: 0, textAlign: 'right',
            }}>
              {decadeLabel(decade)}
            </span>
            <div style={{ flex: 1, height: '5px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden' }}>
              <div style={{
                width: rate !== null ? `${rate * 100}%` : '0%',
                height: '100%',
                background: barColor,
                transition: 'width 0.5s ease',
              }} />
            </div>
            <span style={{
              fontSize: '0.78rem', color: rate !== null ? '#ffffff' : 'var(--border-hi)',
              width: '2.2rem', textAlign: 'right', flexShrink: 0,
            }}>
              {rate !== null ? `${Math.round(rate * 100)}%` : '—'}
            </span>
            <span style={{
              fontSize: '0.65rem', color: 'var(--text-dim)',
              width: '2.8rem', textAlign: 'right', flexShrink: 0,
            }}>
              {played > 0 ? `${solved}/${played}` : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ProfileClient({
  email,
  username: initialUsername,
  portrait: initialPortrait,
  stats,
  friendCount = 0,
  bestSolo,
}: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [portrait, setPortrait] = useState<Portrait | undefined>(initialPortrait);
  const [savingPortrait, setSavingPortrait] = useState(false);
  const [showSetup, setShowSetup] = useState(!initialUsername);
  const [editing, setEditing] = useState(false);

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

  const dim: React.CSSProperties = { fontSize: '0.44rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', fontFamily: 'inherit' };

  return (
    <DeadBrowserShell>
      {showSetup && (
        <UsernameSetupModal
          onComplete={(u) => { setUsername(u); setShowSetup(false); }}
        />
      )}

      <div style={{ padding: '1.75rem 0 5rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* ── Identity ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.25rem' }}>

          {/* Avatar + name row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {portrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/assets/portraits/portrait-${portrait}.png`}
                alt="Your portrait"
                style={{ width: 76, height: 76, borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: 76, height: 76, borderRadius: '4px', background: 'var(--border)', flexShrink: 0 }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', minWidth: 0 }}>
              {username ? (
                <p style={{ fontSize: '2rem', color: '#ffffff', fontWeight: 400, lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  @{username}
                </p>
              ) : (
                <button
                  onClick={() => setShowSetup(true)}
                  className="font-heading"
                  style={{ ...dim, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
                >
                  Claim your @handle →
                </button>
              )}
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {email}
              </span>
            </div>
          </div>

          {/* Sub-links */}
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {username && (
              <Link href={`/u/${username}`} className="font-heading" style={{ ...dim, textDecoration: 'none', color: 'var(--text-dim)' }}>
                Public profile →
              </Link>
            )}
            <Link href="/friends" className="font-heading" style={{ ...dim, textDecoration: 'none', color: 'var(--text-dim)' }}>
              Friends ({friendCount})
            </Link>
            <button
              onClick={() => setEditing(e => !e)}
              className="font-heading"
              style={{ ...dim, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 'auto', color: editing ? 'var(--text)' : 'var(--text-dim)' }}
            >
              {editing ? 'Done' : 'Edit profile'}
            </button>
          </div>

          {/* Edit panel — portrait picker + name + sign out */}
          {editing && (
            <div className="animate-fadein" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p className="font-heading" style={{ ...dim, color: 'var(--text-dim)', marginBottom: '0.1rem' }}>
                Portrait
              </p>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {PORTRAITS.map(p => (
                  <button
                    key={p}
                    onClick={() => handlePortraitSelect(p)}
                    disabled={savingPortrait}
                    style={{
                      background: 'none', border: 'none', padding: 0,
                      cursor: savingPortrait ? 'default' : 'pointer',
                      borderRadius: '4px',
                      outline: portrait === p ? '2px solid var(--text)' : '2px solid transparent',
                      outlineOffset: '3px',
                      opacity: savingPortrait && portrait !== p ? 0.4 : 1,
                      transition: 'outline-color 0.15s, opacity 0.15s',
                    }}
                    aria-label={`${p} portrait`}
                    aria-pressed={portrait === p}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/assets/portraits/portrait-${p}.png`}
                      alt={p}
                      style={{ width: 60, height: 60, display: 'block', borderRadius: '3px', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {username && (
                  <button
                    onClick={() => setShowSetup(true)}
                    className="font-heading"
                    style={{ ...dim, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-dim)' }}
                  >
                    Change @handle
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="font-heading"
                  style={{ ...dim, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-dim)', opacity: 0.5, marginLeft: 'auto' }}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Stats ── */}
        {totalPlayed > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Hero numbers */}
            <div style={{ display: 'flex', gap: '0' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <p style={{ fontSize: '3.8rem', color: '#ffffff', lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em' }}>
                  {winRate}<span style={{ fontSize: '1.8rem', color: 'var(--text-mid)' }}>%</span>
                </p>
                <p className="font-heading" style={{ fontSize: '0.44rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  win rate · {totalSolved} of {totalPlayed}
                </p>
              </div>
              <div style={{ width: '1px', background: 'var(--border)', margin: '0 1.5rem' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', justifyContent: 'center' }}>
                <p style={{ fontSize: '3.8rem', color: '#ffffff', lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em' }}>
                  {streak.current}
                </p>
                <p className="font-heading" style={{ fontSize: '0.44rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  day streak · best {streak.longest}
                </p>
              </div>
            </div>

            {/* Solo best — inline */}
            {bestSolo && (
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <span className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  Solo · best session
                </span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                  <span style={{ fontSize: '1.2rem', color: '#ffffff' }}>{bestSolo.score}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>/ 5000</span>
                </span>
              </div>
            )}

            {/* Decade chart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  Precision by decade
                </p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                  {decadeStats.reduce((s, d) => s + d.played, 0)} games tracked
                </p>
              </div>
              <DecadeChart decadeStats={decadeStats} />
            </div>

          </div>
        )}

        {/* No games yet */}
        {totalPlayed === 0 && (
          <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>
            No games played yet. Come back after your first omen.
          </p>
        )}

      </div>

      <footer style={{ borderTop: '1px solid var(--border-mid)', padding: '1.25rem 0', textAlign: 'center' }}>
        <Link
          href="/"
          className="font-heading"
          style={{ fontSize: '0.84rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none' }}
        >
          ← Back to game
        </Link>
      </footer>
    </DeadBrowserShell>
  );
}
