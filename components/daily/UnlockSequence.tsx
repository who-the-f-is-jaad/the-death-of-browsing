'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { COPY } from '@/lib/copy';

interface Props {
  onComplete: () => void;
}

const DURATION_MS = 2200;

export default function UnlockSequence({ onComplete }: Props) {
  useEffect(() => {
    const id = setTimeout(onComplete, DURATION_MS);
    return () => clearTimeout(id);
  }, [onComplete]);

  return (
    <motion.div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '1.5rem',
        minHeight: '380px',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Expanding rule */}
      <motion.span
        style={{ display: 'block', height: '1px', backgroundColor: 'var(--border-mid)' }}
        initial={{ width: 0 }}
        animate={{ width: 80 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />

      {/* Reveal message */}
      <motion.p
        style={{ fontStyle: 'italic', fontSize: '1rem', color: 'var(--text-mid)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut', delay: 0.4 }}
      >
        {COPY.unlockingLine}
      </motion.p>

      {/* Bottom rule */}
      <motion.span
        style={{ display: 'block', height: '1px', backgroundColor: 'var(--border-mid)' }}
        initial={{ width: 0 }}
        animate={{ width: 80 }}
        transition={{ duration: 1.1, ease: 'easeOut', delay: 0.6 }}
      />
    </motion.div>
  );
}
