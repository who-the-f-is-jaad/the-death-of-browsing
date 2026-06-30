'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import speakerSrc from '@/components/ui/speaker.png';
import { playAmbient, getAmbientElement, isAmbientPlaying } from '@/lib/ambientAudio';

interface Props {
  onComplete: () => void;
}

export default function IntroScreen({ onComplete }: Props) {
  const [playing, setPlaying] = useState(false);
  const unlockedRef = useRef(false);

  const startMusic = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    playAmbient().then(() => setPlaying(true)).catch(() => {});
  }, []);

  useEffect(() => {
    // Pre-create the element so iOS knows it exists before volume buttons are pressed
    const el = getAmbientElement();

    // iOS fires volumechange on audio elements when the physical volume button is pressed
    const onVolumeChange = () => {
      if (!isAmbientPlaying()) startMusic();
    };
    el.addEventListener('volumechange', onVolumeChange);

    // First touch anywhere on the page also unlocks audio (satisfies mobile autoplay policy)
    const onFirstTouch = () => startMusic();
    document.addEventListener('touchstart', onFirstTouch, { once: true, passive: true });

    return () => {
      el.removeEventListener('volumechange', onVolumeChange);
      document.removeEventListener('touchstart', onFirstTouch);
    };
  }, [startMusic]);

  const handleSpeakerClick = () => {
    startMusic();
  };

  const handleOk = () => {
    sessionStorage.setItem('tdb:intro-seen', '1');
    document.dispatchEvent(new CustomEvent('intro-ok'));
    onComplete();
  };

  return (
    <div
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
        gap: '2rem',
        padding: '2rem',
        zIndex: 200,
        animation: 'intro-fade 0.8s ease forwards',
      }}
    >
      <style>{`
        @keyframes intro-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes title-glitch {
          0%   { transform: translateY(0px) rotate(-0.3deg); text-shadow: none; }
          20%  { transform: translateY(-5px) rotate(0.15deg); text-shadow: none; }
          40%  { transform: translateY(-2px) rotate(-0.1deg); text-shadow: none; }
          60%  { transform: translateY(0px) rotate(-0.3deg); text-shadow: none; }

          70%  { transform: translateY(0px) rotate(-0.3deg); text-shadow: none; }
          71%  { transform: translateX(-6px) skewX(-1deg) rotate(-0.3deg); text-shadow: 5px 0 rgba(255,30,60,0.8), -5px 0 rgba(0,210,255,0.8); }
          72%  { transform: translateX(5px) skewX(0.8deg); text-shadow: -4px 0 rgba(255,30,60,0.65), 4px 0 rgba(0,210,255,0.65); }
          73%  { transform: translateX(-3px); text-shadow: 3px 0 rgba(255,30,60,0.5), -3px 0 rgba(0,210,255,0.5); }
          74%  { transform: translateX(0px) rotate(-0.3deg); text-shadow: none; }

          76%  { transform: translateX(-2px) skewX(-0.4deg); text-shadow: 3px 0 rgba(255,30,60,0.55), -3px 0 rgba(0,210,255,0.55); }
          77%  { transform: translateX(0px) rotate(-0.3deg); text-shadow: none; }

          100% { transform: translateY(0px) rotate(-0.3deg); text-shadow: none; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .intro-title {
          animation: title-glitch 7s ease-in-out infinite;
          display: inline-block;
        }
        .intro-line1 { animation: slide-up 0.7s 0.2s ease both; }
        .intro-line2 { animation: slide-up 0.7s 0.5s ease both; }
        .intro-speaker { animation: slide-up 0.7s 0.7s ease both; }
        .intro-cta    { animation: slide-up 0.7s 0.95s ease both; }
        .intro-btn    { animation: slide-up 0.7s 1.1s ease both; }
      `}</style>

      {/* Title */}
      <div className="intro-line1" style={{ textAlign: 'center' }}>
        <span
          className="intro-title font-brand"
          style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1 }}
        >
          The Death<br />of Browsing
        </span>
      </div>

      {/* Subtitle */}
      <p
        className="intro-line2"
        style={{ fontFamily: "'IM Fell DW Pica SC', Georgia, serif", fontStyle: 'italic', fontSize: '1rem', color: 'var(--text-mid)', lineHeight: 1.6, textAlign: 'center', maxWidth: '18rem' }}
      >
        Do you know the difference between the synth-pop of 1983 and the synth-pop of 1984?
      </p>

      {/* Speaker */}
      <button
        onClick={handleSpeakerClick}
        aria-label="Play ambient audio"
        className="intro-speaker"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', lineHeight: 0 }}
      >
        <Image
          src={speakerSrc}
          alt=""
          width={28}
          height={28}
          style={{ filter: 'brightness(0) invert(1)', opacity: playing ? 1 : 0.5, transition: 'opacity 0.25s' }}
          aria-hidden="true"
        />
      </button>

      {/* Volume hint */}
      <p
        className="intro-cta"
        style={{ fontFamily: "'IM Fell DW Pica SC', Georgia, serif", fontSize: '1.1rem', color: playing ? 'var(--text)' : 'var(--text-dim)', lineHeight: 1.4, textAlign: 'center', transition: 'color 0.4s' }}
      >
        Turn volume up.
      </p>

      {/* Enter button */}
      <button onClick={handleOk} className="btn-ghost intro-btn" style={{ maxWidth: '11rem' }}>
        Play
      </button>
    </div>
  );
}
