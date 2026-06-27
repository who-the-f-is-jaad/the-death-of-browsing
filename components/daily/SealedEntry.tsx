'use client';

import Link from 'next/link';
import { playClick } from '@/lib/clickSound';

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
        <div
          className="photo-frame"
          style={{ width: '68%', cursor: 'pointer' }}
          onClick={() => { new Audio('/audio/sheep.wav').play().catch(() => {}); }}
          role="button"
          aria-label="Baa"
        >
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

        <Link
          href="/deathmatch"
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
          Deathmatch
        </Link>

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

    </div>
  );
}
