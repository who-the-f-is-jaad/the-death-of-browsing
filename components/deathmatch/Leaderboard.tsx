'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AnimatedScore from '@/components/ui/AnimatedScore';
import CoinWinOverlay from '@/components/ui/CoinWinOverlay';

type RoundScore = {
  roundIndex: number;
  baseScore: number;
  bonus: number;
  year: number;
  correct: boolean;
};

type PlayerScore = {
  nickname: string;
  portrait?: string | null;
  totalScore: number;
  roundScores: RoundScore[];
  isYou: boolean;
};

interface Props {
  roomId: string;
  playerToken: string | null;
}

function Portrait({ src, size }: { src?: string | null; size: number }) {
  if (!src) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '4px',
        background: 'var(--border-hi)', flexShrink: 0,
      }} />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/assets/portraits/portrait-${src}.png`}
      alt=""
      style={{ width: size, height: size, borderRadius: '4px', objectFit: 'cover', display: 'block', flexShrink: 0 }}
    />
  );
}

const PODIUM_HEIGHTS = [72, 100, 52]; // 2nd, 1st, 3rd
const PODIUM_PORTRAIT_SIZES = [56, 80, 48]; // 2nd, 1st, 3rd
const PODIUM_ORDER = [1, 0, 2]; // index into players array: left=2nd, center=1st, right=3rd

export default function Leaderboard({ roomId, playerToken }: Props) {
  const [players, setPlayers] = useState<PlayerScore[]>([]);
  const [completedRounds, setCompletedRounds] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers: HeadersInit = {};
    if (playerToken) headers['Authorization'] = `Bearer ${playerToken}`;

    fetch(`/api/rooms/${roomId}/leaderboard`, { headers })
      .then(r => r.json())
      .then(data => {
        setPlayers(data.players ?? []);
        setCompletedRounds(data.completedRounds ?? 0);
        setTotalRounds(data.totalRounds ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [roomId, playerToken]);

  const myCoins = useMemo(() => {
    const me = players.find(p => p.isYou);
    if (!me) return 0;
    return Math.floor(me.totalScore / 1000) / 10;
  }, [players]);

  if (loading) return (
    <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
      <p className="font-heading animate-pulse-gold" style={{ fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
        Tallying scores…
      </p>
    </div>
  );

  const winner = players[0];
  const hasPodium = players.length >= 2;
  const restPlayers = players.slice(hasPodium ? 3 : 1);

  return (
    <>
    <CoinWinOverlay coins={myCoins} delayMs={1800} />
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingTop: '0.5rem' }}>

      {/* ── Winner reveal ── */}
      {winner && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.9rem', paddingTop: '0.5rem' }}>
          <p className="font-heading" style={{ fontSize: '0.56rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            {completedRounds} / {totalRounds} rounds · Game over
          </p>

          {/* Portrait with pop */}
          <div className="animate-winner" style={{ position: 'relative', display: 'inline-block' }}>
            <Portrait src={winner.portrait} size={96} />
            {/* Gold crown mark */}
            <div style={{
              position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
              fontSize: '1.1rem', lineHeight: 1,
            }}>
              ✦
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '2.4rem', color: '#ffffff', fontWeight: 400, lineHeight: 1, letterSpacing: '-0.01em' }}>
              {winner.nickname}
              {winner.isYou && (
                <span className="font-heading" style={{ fontSize: '0.56rem', letterSpacing: '0.2em', color: 'var(--text-dim)', marginLeft: '0.6rem', verticalAlign: 'middle' }}>
                  you
                </span>
              )}
            </p>
            <p className="font-brand" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
              <AnimatedScore target={winner.totalScore} duration={1200} />
              <span className="font-heading" style={{ fontSize: '0.56rem', letterSpacing: '0.18em', color: 'var(--text-dim)', marginLeft: '0.4rem' }}>pts</span>
            </p>
          </div>
        </div>
      )}

      {/* ── Podium ── */}
      {hasPodium && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
          {PODIUM_ORDER.map((playerIdx, colIdx) => {
            const p = players[playerIdx];
            if (!p) return <div key={colIdx} style={{ flex: 1 }} />;
            const rank = playerIdx + 1;
            const podiumH = PODIUM_HEIGHTS[colIdx];
            const portraitSize = PODIUM_PORTRAIT_SIZES[colIdx];
            const isCenter = colIdx === 1;

            return (
              <div key={p.nickname} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                {/* Portrait */}
                <div style={{ position: 'relative' }}>
                  <Portrait src={p.portrait} size={portraitSize} />
                  <div style={{
                    position: 'absolute', bottom: -6, right: -6,
                    width: 18, height: 18, borderRadius: '50%',
                    background: isCenter ? 'var(--text)' : 'var(--border-hi)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '0.55rem', fontFamily: 'inherit', color: isCenter ? '#050505' : 'var(--text-dim)', fontWeight: 700, lineHeight: 1 }}>
                      {rank}
                    </span>
                  </div>
                </div>

                {/* Name */}
                <p className="font-heading" style={{
                  fontSize: '0.56rem', letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: p.isYou ? 'var(--text)' : 'var(--text-mid)',
                  textAlign: 'center', maxWidth: '5.5rem',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {p.nickname}
                </p>

                {/* Score */}
                <p className="font-brand" style={{
                  fontSize: isCenter ? '1.3rem' : '1rem',
                  fontWeight: 700, color: isCenter ? 'var(--text)' : 'var(--text-mid)', lineHeight: 1,
                }}>
                  {p.totalScore}
                </p>

                {/* Podium block */}
                <div style={{
                  width: '100%', height: podiumH,
                  background: isCenter ? 'var(--border-hi)' : 'var(--border)',
                  borderTop: `2px solid ${isCenter ? 'var(--text-mid)' : 'var(--border-hi)'}`,
                  marginTop: '0.25rem',
                }} />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Rest of players ── */}
      {restPlayers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {restPlayers.map((p, i) => {
            const rank = (hasPodium ? 3 : 1) + i + 1;
            return (
              <div
                key={p.nickname}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.55rem 0',
                  borderBottom: '1px solid var(--border)',
                  background: p.isYou ? 'rgba(255,255,255,0.02)' : 'none',
                }}
              >
                <span className="font-heading" style={{ fontSize: '0.62rem', color: 'var(--text-dim)', width: '1.2rem', textAlign: 'right', flexShrink: 0 }}>
                  {rank}
                </span>
                <Portrait src={p.portrait} size={32} />
                <span className="font-heading" style={{ fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: p.isYou ? 'var(--text)' : 'var(--text-mid)', flex: 1 }}>
                  {p.nickname}{p.isYou ? ' ★' : ''}
                </span>
                <span className="font-brand" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-mid)' }}>
                  {p.totalScore}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Per-round breakdown (collapsed, all players) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
        <p className="font-heading" style={{ fontSize: '0.48rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
          Round breakdown
        </p>
        {players.map(p => (
          <div key={p.nickname} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
            <span className="font-heading" style={{ fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: p.isYou ? 'var(--text)' : 'var(--text-mid)', width: '5rem', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.nickname}
            </span>
            <div style={{ display: 'flex', gap: '0.25rem', flex: 1, flexWrap: 'wrap' }}>
              {p.roundScores.map(rs => (
                <span
                  key={rs.roundIndex}
                  className="font-heading"
                  style={{
                    fontSize: '0.7rem', letterSpacing: '0.04em',
                    color: rs.correct ? 'var(--text)' : 'var(--text-dim)',
                    background: 'var(--border)', padding: '0.1rem 0.3rem',
                  }}
                  title={`R${rs.roundIndex + 1}: guessed ${rs.year || '—'}, ${rs.baseScore}${rs.bonus ? `+${rs.bonus}` : ''}`}
                >
                  {rs.baseScore + rs.bonus}
                </span>
              ))}
            </div>
            <span className="font-brand" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dim)', flexShrink: 0 }}>
              {p.totalScore}
            </span>
          </div>
        ))}
      </div>

      {/* ── CTAs ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '1rem' }}>
        <Link href="/deathmatch" className="btn-ghost" style={{ textAlign: 'center', display: 'block' }}>
          New room
        </Link>
        <Link
          href="/"
          className="font-heading"
          style={{ fontSize: '0.84rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', textAlign: 'center', textDecoration: 'none' }}
        >
          Back to home
        </Link>
      </div>

    </div>
    </>
  );
}
