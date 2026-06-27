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
      <Image
        src={speakerSrc}
        alt=""
        width={58}
        height={58}
        style={{ filter: 'brightness(0) invert(1)', opacity: 0.88 }}
        aria-hidden="true"
      />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        textAlign: 'center',
        maxWidth: '17rem',
      }}>
        <p style={{
          fontFamily: "'CSNorvile', serif",
          fontSize: '1.4rem',
          color: 'var(--text)',
          lineHeight: 1.4,
        }}>
          Sound on.
        </p>
        <p style={{
          fontFamily: "'CSNorvile', serif",
          fontSize: '0.9rem',
          color: 'var(--text-mid)',
          lineHeight: 1.65,
        }}>
          This is a game that forces you to listen.
        </p>
        <p style={{
          fontFamily: "'CSNorvile', serif",
          fontSize: '0.85rem',
          color: 'var(--text-dim)',
          lineHeight: 1.65,
        }}>
          Turn up your volume before you start.
        </p>
      </div>

      <button
        onClick={handleOk}
        className="btn-ghost"
        style={{ maxWidth: '11rem' }}
      >
        Start
      </button>
    </div>
  );
}
