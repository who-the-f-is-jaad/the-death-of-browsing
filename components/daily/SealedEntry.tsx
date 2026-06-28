'use client';

import Link from 'next/link';
import { playClick } from '@/lib/clickSound';

interface Props {
  onOpenRiddle: () => void;
  plays?: number;
  solves?: number;
  hasFailed?: boolean;
  hasNotPlayed?: boolean;
  hasSolved?: boolean;
}

// Each menu item glitches at a different tempo so they never fire together
const GLITCH_ANIMS = [
  { animationName: 'text-glitch', animationDuration: '7s',  animationDelay: '0s',    animationTimingFunction: 'steps(1)', animationIterationCount: 'infinite' },
  { animationName: 'text-glitch', animationDuration: '11s', animationDelay: '2.3s',  animationTimingFunction: 'steps(1)', animationIterationCount: 'infinite' },
  { animationName: 'text-glitch', animationDuration: '9s',  animationDelay: '4.7s',  animationTimingFunction: 'steps(1)', animationIterationCount: 'infinite' },
  { animationName: 'text-glitch', animationDuration: '13s', animationDelay: '1.1s',  animationTimingFunction: 'steps(1)', animationIterationCount: 'infinite' },
  { animationName: 'text-glitch', animationDuration: '8s',  animationDelay: '6.2s',  animationTimingFunction: 'steps(1)', animationIterationCount: 'infinite' },
];

const menuItemStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  padding: '0.6rem 0',
  borderBottom: '1px solid var(--border)',
  display: 'block',
};

export default function SealedEntry({ onOpenRiddle, plays, solves, hasFailed, hasNotPlayed, hasSolved }: Props) {
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

      {/* Sheep image — floating */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          className="photo-frame"
          style={{
            width: '68%',
            cursor: 'pointer',
            animation: 'sheep-float 5s ease-in-out infinite',
          }}
          onClick={() => { new Audio('/audio/sheep.wav').play().catch(() => {}); }}
          role="button"
          aria-label="Baa"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hasSolved ? '/assets/sheep-success.png' : hasFailed ? '/assets/sheep-fail.png' : '/assets/sheep-card.jpg'}
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
            ...menuItemStyle,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text)',
            textAlign: 'left',
            width: '100%',
            ...GLITCH_ANIMS[0],
          }}
        >
          Daily game{hasNotPlayed && (
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'none', color: 'var(--text-mid)', marginLeft: '0.5rem', fontStyle: 'italic' }}>
              (new today)
            </span>
          )}
        </button>

        <Link
          href="/deathmatch"
          className="font-heading"
          style={{ ...menuItemStyle, color: 'var(--text-mid)', textDecoration: 'none', ...GLITCH_ANIMS[1] }}
        >
          Multiplayer
        </Link>

        <Link
          href="/practice"
          className="font-heading"
          style={{ ...menuItemStyle, color: 'var(--text-mid)', textDecoration: 'none', ...GLITCH_ANIMS[2] }}
        >
          Practice
        </Link>

        <Link
          href="/profile"
          className="font-heading"
          style={{ ...menuItemStyle, color: 'var(--text-mid)', textDecoration: 'none', ...GLITCH_ANIMS[3] }}
        >
          Profile
        </Link>

        <Link
          href="/archive"
          className="font-heading"
          style={{ ...menuItemStyle, color: 'var(--text-mid)', textDecoration: 'none', borderBottom: 'none', ...GLITCH_ANIMS[4] }}
        >
          Archive
        </Link>
      </nav>

    </div>
  );
}
