'use client';

import { COPY } from '@/lib/copy';
import type { StreakData } from '@/lib/types';

interface Props {
  streak: StreakData;
}

export default function StreakDisplay({ streak }: Props) {
  if (streak.current === 0) return null;

  return (
    <div style={{ textAlign: 'right' }}>
      <p
        className="font-heading"
        style={{ fontSize: '0.62rem', letterSpacing: '0.15em', color: 'var(--text-mid)' }}
      >
        {COPY.streakUnit(streak.current)}
      </p>
      <p
        className="font-heading"
        style={{ fontSize: '0.5rem', letterSpacing: '0.1em', color: 'var(--text-dim)', textTransform: 'uppercase' }}
      >
        {COPY.streakLabel}
      </p>
    </div>
  );
}
