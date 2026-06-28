'use client';
import { useState, useEffect, useRef } from 'react';

interface Props {
  target: number;
  duration?: number;
}

export default function AnimatedScore({ target, duration = 900 }: Props) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setValue(0);
    if (target === 0) return;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic: fast start, slows to a stop
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return <>{value}</>;
}
