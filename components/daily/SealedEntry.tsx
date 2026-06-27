'use client';

import { COPY } from '@/lib/copy';
import { getNextResetTimestamp } from '@/lib/resetTime';
import Countdown from './Countdown';

interface Props {
  onOpenRiddle: () => void;
}

export default function SealedEntry({ onOpenRiddle }: Props) {
  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      <div className="photo-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/sheep-card.jpg"
          alt="One record remains"
          style={{ width: '100%', display: 'block', filter: 'grayscale(20%) contrast(1.1)', opacity: 0.9 }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'center' }}>
        <p className="font-heading" style={{ fontSize: '0.72rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--text)' }}>
          The Feed is Dead
        </p>
        <p className="font-heading" style={{ fontSize: '0.6rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>
          One Record Remains
        </p>
      </div>

      {/* Rules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1.25rem 0' }}>
        <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
          Each dawn, a blind excerpt plays. A thirty-second fragment of a record that existed before you found it.
        </p>
        <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
          You have three marks. Each mark buys one listen. After the sound, you name the year the record was born.
        </p>
        <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.7 }}>
          The year must be exact. Close is not enough.
        </p>
      </div>

      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center' }}>
        <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          {COPY.nextRecordLabel}
        </p>
        <Countdown targetTimestamp={getNextResetTimestamp()} className="countdown" />
        <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          07:00 UTC
        </p>
      </div>

      <button onClick={onOpenRiddle} className="btn-ghost">
        {COPY.sealedCTA}
      </button>

    </div>
  );
}
