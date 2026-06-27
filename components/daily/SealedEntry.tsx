'use client';

import { getNextResetTimestamp } from '@/lib/resetTime';
import Countdown from './Countdown';

interface Props {
  onOpenRiddle: () => void;
  plays?: number;
  solves?: number;
}

export default function SealedEntry({ onOpenRiddle, plays, solves }: Props) {
  const showStats = typeof plays === 'number' && plays > 0;
  const solveRate = showStats && typeof solves === 'number' && solves > 0
    ? Math.round((solves / plays!) * 100)
    : null;

  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Daily stats */}
      {showStats && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
          <span className="font-heading" style={{ fontSize: '0.52rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>
            {plays} {plays === 1 ? 'play' : 'plays'} today
          </span>
          {solveRate !== null && (
            <>
              <span style={{ color: 'var(--border-hi)', fontSize: '0.6rem' }}>·</span>
              <span className="font-heading" style={{ fontSize: '0.52rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>
                {solveRate}% solved
              </span>
            </>
          )}
        </div>
      )}

      <div className="photo-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/sheep-card.jpg"
          alt="One record remains"
          style={{ width: '100%', display: 'block', filter: 'grayscale(20%) contrast(1.1)', opacity: 0.9 }}
        />
      </div>

      <button onClick={onOpenRiddle} className="btn-ghost">
        Play
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.5rem' }}>
        <p style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
          A short audio clip plays. Guess the exact year the album came out.
        </p>
        <p style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
          3 attempts, one listen each.
        </p>
        <p style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.7 }}>
          Exact year only. Close doesn&apos;t count.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', paddingTop: '0.25rem' }}>
        <p className="font-heading" style={{ fontSize: '0.52rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Next record
        </p>
        <span style={{ fontFamily: 'var(--font-body, inherit)', fontSize: '0.95rem', color: 'var(--text-mid)', letterSpacing: '0.04em' }}>
          <Countdown targetTimestamp={getNextResetTimestamp()} className="" />
        </span>
      </div>

    </div>
  );
}
