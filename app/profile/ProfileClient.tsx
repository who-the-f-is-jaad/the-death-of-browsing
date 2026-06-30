'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import UsernameSetupModal from '@/components/ui/UsernameSetupModal';
import type { PublicStats, DecadeStat, SoloBest } from '@/lib/db';
import type { Portrait } from '@/lib/auth';
import { PORTRAIT_DEFS } from '@/lib/portraitConfig';

// All decades we always show, 60s → 20s
const ALL_DECADES = [1960, 1970, 1980, 1990, 2000, 2010, 2020];

interface Props {
  email: string;
  username?: string;
  portrait?: Portrait;
  stats: PublicStats;
  friendCount?: number;
  bestSolo: SoloBest | null;
  unlockedPortraits: string[];
  coins: number;
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
  unlockedPortraits: initialUnlocked,
  coins: initialCoins,
}: Props) {
  const [username, setUsername] = useState(initialUsername);
  const [portrait, setPortrait] = useState<Portrait | undefined>(initialPortrait);
  const [savingPortrait, setSavingPortrait] = useState(false);
  const [showSetup, setShowSetup] = useState(!initialUsername);
  const [editing, setEditing] = useState(false);
  const [unlockedPortraits, setUnlockedPortraits] = useState<string[]>(initialUnlocked);
  const [coins, setCoins] = useState(initialCoins);
  const [buying, setBuying] = useState<string | null>(null); // portrait id being purchased
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  const { streak, totalPlayed, totalSolved, precision, decadeStats } = stats;

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

  const handleBuyPortrait = async (portraitId: string) => {
    setBuyLoading(true);
    setBuyError(null);
    const res = await fetch('/api/user/portraits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portrait: portraitId }),
    });
    const data = await res.json();
    setBuyLoading(false);
    if (!res.ok) {
      setBuyError(data.error ?? 'Purchase failed');
      return;
    }
    setUnlockedPortraits(prev => [...prev, portraitId]);
    setCoins(data.coins);
    setBuying(null);
    await handlePortraitSelect(portraitId as Portrait);
  };

  const dim: React.CSSProperties = { fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-mid)', fontFamily: 'inherit' };

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
              <Link href={`/u/${username}`} className="font-heading" style={{ ...dim, textDecoration: 'none' }}>
                Public profile →
              </Link>
            )}
            <Link href="/friends" className="font-heading" style={{ ...dim, textDecoration: 'none' }}>
              Friends ({friendCount})
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/coin.png" alt="" width={12} height={12} style={{ opacity: 0.8 }} />
              <span className="font-heading" style={{ ...dim }}>
                {coins.toFixed(1)}
              </span>
            </div>
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

              {/* Portrait picker header with coin balance */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p className="font-heading" style={{ ...dim, color: 'var(--text-dim)' }}>
                  Portrait
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/coin.png" alt="" width={13} height={13} style={{ opacity: 0.8 }} />
                  <span className="font-heading" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--text-mid)' }}>
                    {coins.toFixed(1)} coins
                  </span>
                </div>
              </div>

              {/* Portrait grid */}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                {PORTRAIT_DEFS.map(def => {
                  const isUnlocked = unlockedPortraits.includes(def.id);
                  const isSelected = portrait === def.id;
                  const isLocked = !isUnlocked;
                  const isBuying = buying === def.id;

                  return (
                    <div key={def.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                      <button
                        onClick={() => {
                          if (isLocked) {
                            setBuying(isBuying ? null : def.id);
                            setBuyError(null);
                          } else {
                            handlePortraitSelect(def.id as Portrait);
                          }
                        }}
                        disabled={savingPortrait || buyLoading}
                        style={{
                          position: 'relative', background: 'none', border: 'none', padding: 0,
                          cursor: (savingPortrait || buyLoading) ? 'default' : 'pointer',
                          borderRadius: '4px',
                          outline: isSelected ? '2px solid var(--text)' : isBuying ? '2px solid var(--text-mid)' : '2px solid transparent',
                          outlineOffset: '3px',
                          opacity: (savingPortrait && !isSelected) || (buyLoading && !isBuying) ? 0.4 : 1,
                          transition: 'outline-color 0.15s, opacity 0.15s',
                        }}
                        aria-label={isLocked ? `${def.label} — ${def.price} coins` : `${def.label} portrait`}
                        aria-pressed={isSelected}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/assets/portraits/portrait-${def.id}.png`}
                          alt={def.label}
                          style={{ width: 60, height: 60, display: 'block', borderRadius: '3px', objectFit: 'cover', filter: isLocked ? 'brightness(0.35)' : 'none', transition: 'filter 0.2s' }}
                        />
                        {isLocked && (
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px' }}>
                            <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>🔒</span>
                            <span className="font-heading" style={{ fontSize: '0.6rem', letterSpacing: '0.06em', color: 'rgba(255,255,255,0.8)' }}>
                              {def.price}
                            </span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/assets/coin.png" alt="" width={8} height={8} style={{ opacity: 0.8 }} />
                          </div>
                        )}
                      </button>
                      <span className="font-heading" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: isSelected ? 'var(--text)' : 'var(--text-mid)' }}>
                        {def.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Buy panel */}
              {buying && (() => {
                const def = PORTRAIT_DEFS.find(p => p.id === buying)!;
                const canAfford = coins >= (def.price ?? 0);
                return (
                  <div className="animate-fadein" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-mid)', lineHeight: 1.5 }}>
                      Unlock the <strong style={{ color: 'var(--text)' }}>{def.label}</strong> portrait for{' '}
                      <strong style={{ color: canAfford ? 'var(--text)' : '#c41a1a' }}>{def.price} coins</strong>
                      {!canAfford && <span style={{ fontSize: '0.78rem', color: '#c41a1a' }}> — you have {coins}</span>}
                    </p>
                    {buyError && (
                      <p style={{ fontStyle: 'italic', fontSize: '0.8rem', color: '#c41a1a' }}>{buyError}</p>
                    )}
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button
                        onClick={() => handleBuyPortrait(buying)}
                        disabled={buyLoading || !canAfford}
                        className="btn-ghost"
                        style={{ flex: 1, opacity: canAfford ? 1 : 0.4 }}
                      >
                        {buyLoading ? 'Unlocking…' : `Unlock · ${def.price} coins`}
                      </button>
                      <button
                        onClick={() => { setBuying(null); setBuyError(null); }}
                        className="font-heading"
                        style={{ ...dim, background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.5rem', color: 'var(--text-dim)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })()}

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
                  {precision}<span style={{ fontSize: '1.8rem', color: 'var(--text-mid)' }}>%</span>
                </p>
                <p className="font-heading" style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>
                  precision · {totalSolved} of {totalPlayed}
                </p>
              </div>
              <div style={{ width: '1px', background: 'var(--border)', margin: '0 1.5rem' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', justifyContent: 'center' }}>
                <p style={{ fontSize: '3.8rem', color: '#ffffff', lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em' }}>
                  {streak.current}
                </p>
                <p className="font-heading" style={{ fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>
                  day streak · best {streak.longest}
                </p>
              </div>
            </div>

            {/* Solo best — inline */}
            {bestSolo && (
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <span className="font-heading" style={{ fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>
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
                <p className="font-heading" style={{ fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>
                  Precision by decade
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-mid)', fontStyle: 'italic' }}>
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
