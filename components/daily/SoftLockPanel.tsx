'use client';

import { useState } from 'react';
import { COPY } from '@/lib/copy';
import Countdown from './Countdown';

interface Props {
  expiresAt: number;
  onRetry: () => void;
}

export default function SoftLockPanel({ expiresAt, onRetry }: Props) {
  const [expired, setExpired] = useState(() => expiresAt <= Date.now());

  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="inscription" style={{ borderColor: 'rgba(122,18,18,0.35)', textAlign: 'center', padding: '2.5rem 1.5rem' }}>
        <p
          className="font-heading"
          style={{ fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '0.75rem' }}
        >
          {COPY.softLockTitle}
        </p>

        <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.7, maxWidth: '26ch', margin: '0 auto' }}>
          {COPY.softLockBody}
        </p>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
          {!expired ? (
            <>
              <p
                className="font-heading"
                style={{ fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}
              >
                {COPY.softLockCountdownLabel}
              </p>
              <Countdown
                targetTimestamp={expiresAt}
                onExpire={() => setExpired(true)}
                className="countdown"
              />
            </>
          ) : (
            <p
              className="font-heading"
              style={{ fontSize: '0.52rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-mid)' }}
            >
              {COPY.softLockExpiredLabel}
            </p>
          )}
        </div>
      </div>

      {expired && (
        <button onClick={onRetry} className="btn-ghost">
          {COPY.softLockRetryLabel}
        </button>
      )}
    </div>
  );
}
