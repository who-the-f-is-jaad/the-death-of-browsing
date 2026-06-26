'use client';

import { useState } from 'react';
import { COPY } from '@/lib/copy';
import { generateShareText, copyToClipboard } from '@/lib/share';
import type { Attempt } from '@/lib/types';

interface Props {
  entryNumber: number;
  attempts: Attempt[];
  solved: boolean;
}

export default function ShareButton({ entryNumber, attempts, solved }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url =
      typeof window !== 'undefined' ? window.location.href : 'thedeathofbrowsing.com';
    const text = generateShareText(entryNumber, attempts, solved, url);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="btn-ghost w-full"
      aria-live="polite"
      aria-label={COPY.shareLabel}
    >
      {copied ? COPY.shareCopied : COPY.shareLabel}
    </button>
  );
}
