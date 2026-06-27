'use client';

import { useState } from 'react';
import Countdown from './Countdown';
import type { OmenGuess } from '@/lib/omenTypes';

interface Props {
  expiresAt: number;
  onRetry: () => void;
  scars?: OmenGuess[];
}

export default function SoftLockPanel({ expiresAt, onRetry, scars = [] }: Props) {
  const [expired, setExpired] = useState(() => expiresAt <= Date.now());

  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <p className="font-heading" style={{ fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '0.75rem' }}>
          The Rite is Broken
        </p>
        <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.7, maxWidth: '28ch', margin: '0 auto' }}>
          Three years were cast. None were true. The omen withdraws for one hour.
        </p>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
          {!expired ? (
            <>
              <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                The omen resumes in
              </p>
              <Countdown
                targetTimestamp={expiresAt}
                onExpire={() => setExpired(true)}
                className="countdown"
              />
            </>
          ) : (
            <p className="font-heading" style={{ fontSize: '0.52rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>
              The Rite Resumes. The Scars Remain.
            </p>
          )}
        </div>
      </div>

      {/* Scars */}
      {scars.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Scars
          </p>
          {scars.map((g, i) => {
            const bandDir = g.band && g.direction
              ? `${g.band}, ${g.direction === 'UNBORN' ? 'before the birth' : 'after the burial'}`
              : 'unknown';
            return (
              <p key={i} className="font-heading" style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                {g.year} — {bandDir}
              </p>
            );
          })}
        </div>
      )}

      {expired && (
        <button onClick={onRetry} className="btn-ghost">
          Resume the Rite
        </button>
      )}
    </div>
  );
}
