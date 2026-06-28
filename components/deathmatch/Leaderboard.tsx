'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type RoundScore = {
  roundIndex: number;
  baseScore: number;
  bonus: number;
  year: number;
  correct: boolean;
  band: string | null;
  direction: string | null;
};

type PlayerScore = {
  nickname: string;
  totalScore: number;
  roundScores: RoundScore[];
  isYou: boolean;
};

interface Props {
  roomId: string;
  playerToken: string | null;
}

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

  const winner = players[0];

  if (loading) return (
    <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
      <p className="font-heading" style={{ fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
        Tallying scores…
      </p>
    </div>
  );

  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingTop: '0.5rem' }}>

      {/* Header */}
      <div>
        <p className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
          Game over · {completedRounds} / {totalRounds} rounds
        </p>
        <p className="font-brand" style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 0.9, color: 'var(--text)' }}>
          Results
        </p>
      </div>

      {/* Winner callout */}
      {winner && (
        <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1rem 0', textAlign: 'center' }}>
          <p className="font-heading" style={{ fontSize: '0.76rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
            Winner
          </p>
          <p className="font-brand" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
            {winner.nickname}
          </p>
          <p className="font-heading" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--text-mid)', marginTop: '0.2rem' }}>
            {winner.totalScore} pts
          </p>
        </div>
      )}

      {/* Full table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {players.map((p, i) => (
          <div
            key={p.nickname}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0',
              borderBottom: '1px solid var(--border)',
              background: p.isYou ? 'var(--surface-mid)' : 'none',
            }}
          >
            <span className="font-heading" style={{ fontSize: '0.7rem', color: 'var(--text-dim)', minWidth: '1.5rem', textAlign: 'right' }}>
              {i + 1}
            </span>
            <div style={{ flex: 1 }}>
              <span className="font-heading" style={{ fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: p.isYou ? 'var(--text)' : 'var(--text-mid)' }}>
                {p.nickname}{p.isYou ? ' (you)' : ''}
              </span>
              {/* Per-round breakdown — compact */}
              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                {p.roundScores.map(rs => (
                  <span
                    key={rs.roundIndex}
                    className="font-heading"
                    style={{ fontSize: '0.92rem', letterSpacing: '0.1em', color: rs.correct ? 'var(--text)' : 'var(--text-dim)', background: 'var(--border)', padding: '0.1rem 0.3rem' }}
                    title={`R${rs.roundIndex + 1}: guessed ${rs.year}, base ${rs.baseScore}${rs.bonus ? ` +${rs.bonus}` : ''}`}
                  >
                    R{rs.roundIndex + 1}: {rs.baseScore + rs.bonus}
                  </span>
                ))}
              </div>
            </div>
            <span className="font-brand" style={{ fontSize: '1.4rem', fontWeight: 700, color: i === 0 ? 'var(--text)' : 'var(--text-mid)' }}>
              {p.totalScore}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '1rem' }}>
        <Link href="/deathmatch" className="btn-ghost" style={{ textAlign: 'center', display: 'block' }}>
          New room
        </Link>
        <Link href="/" className="font-heading" style={{ fontSize: '0.84rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', textAlign: 'center', textDecoration: 'none' }}>
          Back to home
        </Link>
      </div>

    </div>
  );
}
