'use client';

import Link from 'next/link';
import { getNextResetTimestamp } from '@/lib/resetTime';
import { playClick } from '@/lib/clickSound';
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

      {/* Sheep image — smaller, centered */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="photo-frame" style={{ width: '68%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/sheep-card.jpg"
            alt="One record remains"
            style={{ width: '100%', display: 'block', filter: 'grayscale(20%) contrast(1.1)', opacity: 0.9 }}
          />
        </div>
      </div>

      {/* Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
        <button
          onClick={() => { playClick(); onOpenRiddle(); }}
          className="font-heading"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.1rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text)',
            textAlign: 'left',
            padding: '0.6rem 0',
            borderBottom: '1px solid var(--border)',
          }}
        >
          Daily game
        </button>

        <div
          className="font-heading"
          style={{
            fontSize: '1.1rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            padding: '0.6rem 0',
            borderBottom: '1px solid var(--border)',
            cursor: 'not-allowed',
            display: 'flex',
            alignItems: 'baseline',
            gap: '0.5rem',
          }}
        >
          Multiplayer
          <span style={{ fontSize: '0.48rem', letterSpacing: '0.18em', color: 'var(--text-dim)' }}>soon</span>
        </div>

        <Link
          href="/profile"
          className="font-heading"
          style={{
            fontSize: '1.1rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-mid)',
            textDecoration: 'none',
            padding: '0.6rem 0',
            borderBottom: '1px solid var(--border)',
            display: 'block',
          }}
        >
          Profile
        </Link>

        <Link
          href="/archive"
          className="font-heading"
          style={{
            fontSize: '1.1rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-mid)',
            textDecoration: 'none',
            padding: '0.6rem 0',
            display: 'block',
          }}
        >
          Archive
        </Link>
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.25rem' }}>
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
