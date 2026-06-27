'use client';

import { getNextResetTimestamp } from '@/lib/resetTime';
import Countdown from './Countdown';

interface Props {
  onOpenRiddle: () => void;
}

export default function SealedEntry({ onOpenRiddle }: Props) {
  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Daily stats — placeholder until server-side analytics are wired */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
        <span className="font-heading" style={{ fontSize: '0.52rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>
          312 plays today
        </span>
        <span style={{ color: 'var(--border-hi)', fontSize: '0.6rem' }}>·</span>
        <span className="font-heading" style={{ fontSize: '0.52rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>
          67% solved
        </span>
      </div>

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
