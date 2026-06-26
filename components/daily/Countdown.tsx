'use client';

import { useState, useEffect, useRef } from 'react';

interface Props {
  /** Epoch ms timestamp to count down to. */
  targetTimestamp: number;
  /** Called once when the countdown reaches zero. */
  onExpire?: () => void;
  className?: string;
}

function formatMs(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

export default function Countdown({ targetTimestamp, onExpire, className }: Props) {
  const [remaining, setRemaining] = useState(() => targetTimestamp - Date.now());
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;

    const tick = () => {
      const r = targetTimestamp - Date.now();
      setRemaining(r);
      if (r <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpire?.();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTimestamp, onExpire]);

  return (
    <span className={className ?? 'countdown'}>
      {formatMs(remaining)}
    </span>
  );
}
