'use client';

import { useState } from 'react';
import Image from 'next/image';
import speakerSrc from '@/components/ui/speaker.png';
import { playAmbient, isAmbientPlaying } from '@/lib/ambientAudio';

interface Props {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: Props) {
  const [playing, setPlaying] = useState(false);

  const handleSpeakerClick = () => {
    playAmbient().then(() => setPlaying(true)).catch(() => {});
  };

  const handleOk = () => {
    sessionStorage.setItem('tdb:intro-seen', '1');
    document.dispatchEvent(new CustomEvent('intro-ok'));
    onComplete();
  };

  return (
    <div
      className="animate-fadein"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg)',
        backgroundImage: "url('/textures/black-paper.png')",
        backgroundSize: '480px 480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.25rem',
        padding: '2rem',
        zIndex: 200,
      }}
    >
      <p
        className="font-brand"
        style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, textAlign: 'center' }}
      >
        The Death of Browsing
      </p>

      <p style={{ fontFamily: "'CSNorvile', serif", fontSize: '1rem', color: 'var(--text-mid)', lineHeight: 1.55, textAlign: 'center', maxWidth: '16rem' }}>
        This is a music discovery game based on listening.
      </p>

      <button
        onClick={handleSpeakerClick}
        aria-label="Play ambient audio"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', lineHeight: 0 }}
      >
        <Image
          src={speakerSrc}
          alt=""
          width={58}
          height={58}
          style={{ filter: 'brightness(0) invert(1)', opacity: playing ? 1 : 0.7, transition: 'opacity 0.2s' }}
          aria-hidden="true"
        />
      </button>

      <p style={{ fontFamily: "'CSNorvile', serif", fontSize: '1.4rem', color: 'var(--text)', lineHeight: 1.4, textAlign: 'center' }}>
        Turn volume up.
      </p>

      <button onClick={handleOk} className="btn-ghost" style={{ maxWidth: '11rem' }}>
        Enter
      </button>
    </div>
  );
}
