'use client';

import { useState } from 'react';
import { generateShareText, shareOrCopy } from '@/lib/share';
import type { OmenLocalState } from '@/lib/omenTypes';

interface Props {
  omenState: OmenLocalState;
  date: string;
}

export default function ShareButton({ omenState, date }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = generateShareText(omenState, date);
    const result = await shareOrCopy(text);
    if (result !== 'failed') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="btn-ghost w-full"
      aria-live="polite"
    >
      {copied ? 'Copied!' : 'Share result'}
    </button>
  );
}
