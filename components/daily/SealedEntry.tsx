'use client';

import { COPY } from '@/lib/copy';
import { getNextResetTimestamp } from '@/lib/resetTime';
import type { DailyEntry } from '@/lib/types';
import Countdown from './Countdown';

interface Props {
  entry: DailyEntry;
  onOpenRiddle: () => void;
}

export default function SealedEntry({ entry, onOpenRiddle }: Props) {
  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* ── Devotional card image ─────────────────────────────────────── */}
      {/* TODO: If the sheep image disappears, place it at /public/assets/sheep-card.jpg */}
      <div className="photo-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/sheep-card.jpg"
          alt="One record remains"
          style={{ width: '100%', display: 'block', filter: 'grayscale(20%) contrast(1.1)', opacity: 0.9 }}
        />
      </div>

      {/* ── Sparse copy ─────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <p
          className="font-heading"
          style={{ fontSize: '0.72rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--text)' }}
        >
          THE FEED IS DEAD
        </p>
        <p
          className="font-heading"
          style={{ fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-mid)' }}
        >
          ONE RECORD REMAINS
        </p>
      </div>

      {/* ── Countdown ────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center' }}>
        <p
          className="font-heading"
          style={{ fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}
        >
          {COPY.nextRecordLabel}
        </p>
        <Countdown targetTimestamp={getNextResetTimestamp()} className="countdown" />
        <p
          className="font-heading"
          style={{ fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)' }}
        >
          {COPY.nextResetMeridian}
        </p>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <button onClick={onOpenRiddle} className="btn-ghost">
        {COPY.sealedCTA}
      </button>

    </div>
  );
}
