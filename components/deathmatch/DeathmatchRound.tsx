'use client';

import { useState, useRef } from 'react';

type GuessResult = {
  score: number;
  correct: boolean;
  band: string | null;
  direction: string | null;
};

interface Props {
  roundIndex: number;
  totalRounds: number;
  audioUrl: string;
  players: Array<{ nickname: string; hasGuessedCurrentRound: boolean }>;
  onGuess: (year: number) => Promise<GuessResult>;
  isHost: boolean;
  onAdvance: () => Promise<void>;
}

export default function DeathmatchRound({
  roundIndex, totalRounds, audioUrl, players, onGuess, isHost, onAdvance,
}: Props) {
  const [audioStatus, setAudioStatus] = useState<'idle' | 'playing' | 'paused' | 'error'>('idle');
  const [year, setYear] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleListen = () => {
    if (audioStatus === 'playing') {
      audioRef.current?.pause();
      setAudioStatus('paused');
      return;
    }

    if (!audioRef.current) {
      const el = new Audio(audioUrl);
      el.addEventListener('ended', () => setAudioStatus('idle'));
      el.addEventListener('error', () => setAudioStatus('error'));
      audioRef.current = el;
    }

    audioRef.current.play().then(() => setAudioStatus('playing')).catch(() => setAudioStatus('error'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const y = parseInt(year, 10);
    if (isNaN(y) || y < 1900 || y > new Date().getFullYear()) return;

    setSubmitting(true);
    audioRef.current?.pause();
    setAudioStatus('idle');

    try {
      await onGuess(y);
    } catch {
      setSubmitting(false);
    }
  };

  const listenLabel = audioStatus === 'playing' ? 'Pause' : audioStatus === 'paused' ? 'Resume' : 'Listen';

  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Round counter */}
      <div style={{ paddingTop: '0.5rem' }}>
        <p className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
          Round {roundIndex + 1} / {totalRounds}
        </p>
        <p className="font-brand" style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 0.95, color: 'var(--text)' }}>
          Deathmatch
        </p>
      </div>

      {/* Record placeholder */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="photo-frame" style={{ width: '72%', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-mid)' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            border: `3px solid var(--border-hi)`,
            opacity: audioStatus === 'playing' ? 0.8 : 0.25,
            transition: 'opacity 0.3s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--border-hi)', opacity: 0.6 }} />
          </div>
        </div>
      </div>

      {/* Listen button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {audioStatus === 'error' ? (
          <p className="font-heading" style={{ fontSize: '0.85rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c41a1a' }}>
            Audio unavailable
          </p>
        ) : (
          <button
            onClick={handleListen}
            className="btn-ghost"
            style={{ minWidth: '7rem' }}
            disabled={submitting}
          >
            {listenLabel}
          </button>
        )}
      </div>

      {/* Year input */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <p className="font-heading" style={{ fontSize: '0.84rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)', textAlign: 'center' }}>
            Guess the year
          </p>
          <input
            type="number"
            value={year}
            onChange={e => setYear(e.target.value)}
            min={1900}
            max={new Date().getFullYear()}
            placeholder="e.g. 1994"
            className="ritual-input"
            style={{ fontSize: '2rem', textAlign: 'center', padding: '0.4rem 0' }}
            disabled={submitting}
            required
          />
        </div>
        <button type="submit" className="btn-ghost" disabled={submitting || !year}>
          {submitting ? 'Sending…' : 'Lock in'}
        </button>
      </form>

      {/* Live player status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <p className="font-heading" style={{ fontSize: '0.74rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
          Opponents
        </p>
        {players.map(p => (
          <div key={p.nickname} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid var(--border)' }}>
            <span className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>
              {p.nickname}
            </span>
            <span style={{ fontSize: '0.875rem', color: p.hasGuessedCurrentRound ? 'var(--text)' : 'var(--text-dim)' }}>
              {p.hasGuessedCurrentRound ? 'Locked in' : '…'}
            </span>
          </div>
        ))}
      </div>

      {/* Host skip */}
      {isHost && (
        <button onClick={onAdvance} className="btn-ghost" style={{ fontSize: '0.9rem', opacity: 0.6 }}>
          Skip round (host)
        </button>
      )}

    </div>
  );
}
