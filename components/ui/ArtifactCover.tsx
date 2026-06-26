'use client';

import { useState } from 'react';

interface Props {
  src: string;
  alt: string;
  entryNumber: number;
  date?: string;
}

export default function ArtifactCover({ src, alt, entryNumber, date }: Props) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className="photo-fallback">
        <p className="photo-fallback-title">
          NO COVER<br />SURVIVED
        </p>
        <p className="photo-fallback-ref">
          ENTRY № {String(entryNumber).padStart(3, '0')}
          {date ? ` · ${date}` : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="photo-frame">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        onError={() => setErrored(true)}
        loading="eager"
      />
    </div>
  );
}
