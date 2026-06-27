'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import speakerSrc from './speaker.png';

interface Props {
  entryNumber: number;
  entryDate: string;
  streakNode?: React.ReactNode;
}

export default function ObituaryHeader({ entryDate: _entryDate, streakNode }: Props) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAmbient = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/audio/pest.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.28;
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <header className="cat-header">
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Link href="/" className="cat-brand" style={{ textDecoration: 'none' }}>
          The Death of Browsing
        </Link>
        <div style={{ position: 'absolute', right: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {streakNode}
          <button
            onClick={toggleAmbient}
            aria-label={playing ? 'Stop ambient audio' : 'Play ambient audio'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              lineHeight: 0,
            }}
          >
            <Image
              src={speakerSrc}
              alt=""
              width={16}
              height={16}
              style={{
                filter: 'brightness(0) invert(1)',
                opacity: playing ? 0.9 : 0.4,
                transition: 'opacity 0.2s',
              }}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.4, marginTop: '0.35rem', textAlign: 'center' }}>
        Listen harder.
      </p>
    </header>
  );
}
