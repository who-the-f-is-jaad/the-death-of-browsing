'use client';

import { useEffect, useRef, useState } from 'react';
import { playClick } from '@/lib/clickSound';

interface Props {
  roundIndex: number;
  audioUrl: string;
  onGuess: (year: number) => void;
}

export default function SoloRound({ roundIndex, audioUrl, onGuess }: Props) {
  const [phase, setPhase] = useState<'countdown' | 'playing' | 'submitted'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [year, setYear] = useState('');
  const [audioError, setAudioError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const submittedRef = useRef(false);
  const yearRef = useRef('');
  const onGuessRef = useRef(onGuess);
  const doSubmitRef = useRef<(y: number) => void>(() => {});

  yearRef.current = year;
  onGuessRef.current = onGuess;

  // Stable doSubmit that always uses latest onGuess and yearRef
  doSubmitRef.current = (y: number) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    audioRef.current?.pause();
    setPhase('submitted');
    onGuessRef.current(y);
  };

  useEffect(() => {
    let count = 3;

    const startAudio = () => {
      const el = new Audio(audioUrl);
      audioRef.current = el;

      el.addEventListener('loadedmetadata', () => {
        if (isFinite(el.duration) && el.duration > 0) setDuration(el.duration);
      });
      el.addEventListener('timeupdate', () => setCurrentTime(el.currentTime));
      el.addEventListener('ended', () => {
        const raw = parseInt(yearRef.current, 10);
        const y = isFinite(raw) && raw >= 1900 && raw <= new Date().getFullYear() ? raw : 0;
        doSubmitRef.current(y);
      });
      el.addEventListener('error', () => setAudioError(true));

      setPhase('playing');
      el.play().catch(() => setAudioError(true));
    };

    const tick = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(tick);
        startAudio();
      } else {
        playClick();
        setCountdown(count);
      }
    }, 1000);

    return () => {
      clearInterval(tick);
      audioRef.current?.pause();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const y = parseInt(year, 10);
    if (isNaN(y) || y < 1900 || y > new Date().getFullYear()) return;
    doSubmitRef.current(y);
  };

  const remaining = Math.max(0, duration - currentTime);
  const progress = duration > 0 ? (duration - currentTime) / duration : 1;

  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Round counter */}
      <div style={{ paddingTop: '0.5rem' }}>
        <p className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Round {roundIndex + 1} / 5
        </p>
      </div>

      {/* Countdown or audio timer */}
      {phase === 'countdown' ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '7rem' }}>
          <p
            key={countdown}
            className="font-brand animate-fadein"
            style={{ fontSize: '7rem', fontWeight: 700, lineHeight: 1, color: 'var(--text)', opacity: 0.9 }}
          >
            {countdown}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
                background: 'var(--text)',
                transition: 'width 0.25s linear',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {audioError ? (
              <span className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c41a1a' }}>
                Audio unavailable — submit anyway
              </span>
            ) : (
              <span className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                {Math.ceil(remaining)}s remaining
              </span>
            )}
          </div>
        </div>
      )}

      {/* Year input + lock in */}
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
            disabled={phase === 'submitted'}
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="btn-ghost"
          disabled={phase !== 'playing' || !year}
        >
          {phase === 'submitted' ? 'Locked in' : 'Lock in'}
        </button>
      </form>

    </div>
  );
}
