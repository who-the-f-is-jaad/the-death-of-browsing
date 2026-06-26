'use client';

import { useState } from 'react';
import { cn } from '@/lib/classNames';

interface Props {
  youtubeEmbedUrl: string;
  albumTitle: string;
  artist: string;
  className?: string;
}

export default function ListeningChamber({ youtubeEmbedUrl, albumTitle, artist, className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn('chamber', className)}>
      <button
        className="chamber-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls="listening-chamber-iframe"
      >
        <span className="chamber-icon" aria-hidden="true">{open ? '▼' : '▶'}</span>
        <span className="chamber-label font-heading">
          {open ? 'Close' : 'Listening chamber'}
        </span>
        <span className="chamber-meta font-serif">
          {artist} — {albumTitle}
        </span>
      </button>

      {open && (
        <div className="chamber-body" id="listening-chamber-iframe">
          <iframe
            src={youtubeEmbedUrl}
            title={`${albumTitle} by ${artist}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="chamber-iframe"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
