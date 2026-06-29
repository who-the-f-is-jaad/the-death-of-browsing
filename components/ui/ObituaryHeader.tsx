'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import speakerSrc from './speaker.png';
import { playAmbient, pauseAmbient, isAmbientPlaying } from '@/lib/ambientAudio';

interface Props {
  entryNumber: number;
  entryDate: string;
  streakNode?: React.ReactNode;
  leftNode?: React.ReactNode;
  onLogoClick?: () => void;
}

export default function ObituaryHeader({ entryDate: _entryDate, streakNode, leftNode, onLogoClick }: Props) {
  const [playing, setPlaying] = useState(false);

  // Sync with actual audio state (another component may have started it)
  useEffect(() => {
    setPlaying(isAmbientPlaying());
  }, []);

  const handleToggle = async () => {
    if (isAmbientPlaying()) {
      pauseAmbient();
      setPlaying(false);
    } else {
      try {
        await playAmbient();
        setPlaying(true);
      } catch {
        // autoplay blocked by browser — leave icon dim
      }
    }
  };

  return (
    <header className="cat-header">
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {leftNode && (
          <div style={{ position: 'absolute', left: 0, display: 'flex', alignItems: 'center' }}>
            {leftNode}
          </div>
        )}
        <Link
          href="/"
          className="cat-brand"
          style={{ textDecoration: 'none' }}
          onClick={onLogoClick
            ? (e) => { e.preventDefault(); onLogoClick(); }
            : () => { sessionStorage.setItem('tdb:go-menu', '1'); }
          }
        >
          The Death of Browsing
        </Link>
        <div style={{ position: 'absolute', right: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleToggle}
            aria-label={playing ? 'Stop ambient audio' : 'Play ambient audio'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', lineHeight: 0 }}
          >
            <Image
              src={speakerSrc}
              alt=""
              width={16}
              height={16}
              style={{ filter: 'brightness(0) invert(1)', opacity: playing ? 0.9 : 0.4, transition: 'opacity 0.2s' }}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.4, marginTop: '0.35rem', textAlign: 'center' }}>
        guess the year.
      </p>
    </header>
  );
}
