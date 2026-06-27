'use client';

import Image from 'next/image';
import speakerSrc from '@/components/ui/speaker.png';

interface Props {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: Props) {
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
        style={{
          fontSize: '2.4rem',
          fontWeight: 700,
          color: 'var(--text)',
          lineHeight: 1.1,
          textAlign: 'center',
        }}
      >
        The Death of Browsing
      </p>

      <p style={{
        fontFamily: "'CSNorvile', serif",
        fontSize: '1rem',
        color: 'var(--text-mid)',
        lineHeight: 1.55,
        textAlign: 'center',
        maxWidth: '16rem',
      }}>
        This is a music discovery game based on listening.
      </p>

      <Image
        src={speakerSrc}
        alt=""
        width={58}
        height={58}
        style={{ filter: 'brightness(0) invert(1)', opacity: 0.88 }}
        aria-hidden="true"
      />

      <p style={{
        fontFamily: "'CSNorvile', serif",
        fontSize: '1.4rem',
        color: 'var(--text)',
        lineHeight: 1.4,
        textAlign: 'center',
      }}>
        Turn volume up.
      </p>

      <button
        onClick={handleOk}
        className="btn-ghost"
        style={{ maxWidth: '11rem' }}
      >
        Enter
      </button>
    </div>
  );
}
