'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Countdown from './Countdown';
import { generateHelpShareText, shareOrCopy } from '@/lib/share';
import type { OmenGuess } from '@/lib/omenTypes';

interface Props {
  expiresAt: number;
  onRetry: () => void;
  scars?: OmenGuess[];
  date?: string;
}

export default function SoftLockPanel({ expiresAt, onRetry, scars = [], date = '' }: Props) {
  const [expired, setExpired] = useState(() => expiresAt <= Date.now());
  const [helpCopied, setHelpCopied] = useState(false);

  const handleAskFriend = useCallback(async () => {
    const text = generateHelpShareText(scars, date);
    const result = await shareOrCopy(text);
    if (result !== 'failed') {
      setHelpCopied(true);
      setTimeout(() => setHelpCopied(false), 2000);
    }
  }, [scars, date]);

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

      {/* Ask a friend to help */}
      <button onClick={handleAskFriend} className="btn-ghost">
        {helpCopied ? 'Copied!' : 'Ask a friend for help'}
      </button>

      {/* Practice link */}
      <div style={{ textAlign: 'center' }}>
        <Link
          href="/practice"
          className="font-heading"
          style={{ fontSize: '0.52rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none', borderBottom: '1px solid var(--border-mid)', paddingBottom: '1px' }}
        >
          Practice on yesterday&apos;s record
        </Link>
      </div>

      {expired && (
        <button onClick={onRetry} className="btn-ghost">
          Resume the Rite
        </button>
      )}
    </div>
  );
}
