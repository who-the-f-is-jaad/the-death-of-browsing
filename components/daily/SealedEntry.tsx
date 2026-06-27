'use client';

import { COPY } from '@/lib/copy';
import { getNextResetTimestamp } from '@/lib/resetTime';
import Countdown from './Countdown';

interface Props {
  onOpenRiddle: () => void;
}

export default function SealedEntry({ onOpenRiddle }: Props) {
  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div className="photo-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/sheep-card.jpg"
          alt="One record remains"
          style={{ width: '100%', display: 'block', filter: 'grayscale(20%) contrast(1.1)', opacity: 0.9 }}
        />
      </div>

      {/* CTA immediately under the sheep */}
      <button onClick={onOpenRiddle} className="btn-ghost">
        {COPY.sealedCTA}
      </button>

      {/* Rules — bigger, readable */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.5rem' }}>
        <p style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
          Each dawn, a blind excerpt plays. Name the exact year the record was born.
        </p>
        <p style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
          Three marks. Each mark buys one listen.
        </p>
        <p style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.7 }}>
          Exact year only. Close is not enough.
        </p>
      </div>

      {/* Next record */}
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
