'use client';

import type { DailyEntry } from '@/lib/types';

interface Props {
  entry: DailyEntry;
}

const DSP_LABEL_STYLE: React.CSSProperties = {
  fontSize: '0.88rem',
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
};

export default function DspLinks({ entry }: Props) {
  const links = [
    { label: 'Spotify',      href: entry.spotifyUrl      },
    { label: 'Deezer',       href: entry.deezerUrl       },
    { label: 'Apple Music',  href: entry.appleMusicUrl   },
    { label: 'YT Music',     href: entry.youtubeMusicUrl },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <p
        className="font-heading"
        style={{ fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.25rem' }}
      >
        Listen
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
        {links.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="dsp-secondary font-heading"
            style={DSP_LABEL_STYLE}
            aria-label={`${label} — ${entry.album} by ${entry.artist}`}
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
