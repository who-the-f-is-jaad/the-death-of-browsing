'use client';

import { COPY } from '@/lib/copy';
import type { DailyEntry } from '@/lib/types';

interface Props {
  entry: DailyEntry;
}

export default function DspLinks({ entry }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {/* Primary: Deezer — crimson stamped strip */}
      <a
        href={entry.deezerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="dsp-primary font-heading"
        aria-label={`${COPY.listenOnDeezer} — ${entry.album} by ${entry.artist}`}
      >
        {COPY.listenOnDeezer}
      </a>

      {/* Secondary DSPs — quiet row */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <a
          href={entry.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="dsp-secondary font-heading"
          aria-label={`${COPY.listenOnSpotify} — ${entry.album}`}
        >
          {COPY.listenOnSpotify}
        </a>
        <a
          href={entry.appleMusicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="dsp-secondary font-heading"
          aria-label={`${COPY.listenOnAppleMusic} — ${entry.album}`}
        >
          {COPY.listenOnAppleMusic}
        </a>
        <a
          href={entry.youtubeMusicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="dsp-secondary font-heading"
          aria-label={`YouTube Music — ${entry.album}`}
        >
          YT Music
        </a>
      </div>
    </div>
  );
}
