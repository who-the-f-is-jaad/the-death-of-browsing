'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'tdb:audio-enabled';
const AUDIO_SRC = '/audio/pest.mp3';
const VOLUME = 0.11;

export default function GlobalAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoResumeRef = useRef<(() => void) | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  // Keep a ref in sync with `enabled` so the omen event handlers (registered once)
  // always read the current value rather than a stale closure.
  const enabledRef = useRef(enabled);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  useEffect(() => {
    const pref = localStorage.getItem(STORAGE_KEY) === 'true';

    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.volume = VOLUME;
    audioRef.current = audio;

    setEnabled(pref);
    setReady(true);

    if (pref) {
      const tryResume = () => {
        audio.play().catch(() => {});
        autoResumeRef.current = null;
      };
      autoResumeRef.current = tryResume;
      document.addEventListener('click', tryResume, { once: true });
      document.addEventListener('touchstart', tryResume, { once: true });
    }

    // Pause background audio while the omen sounds; resume after, if enabled.
    const handleOmenStart = () => { audio.pause(); };
    const handleOmenStop = () => { if (enabledRef.current) audio.play().catch(() => {}); };
    document.addEventListener('omen-audio-start', handleOmenStart);
    document.addEventListener('omen-audio-stop', handleOmenStop);

    // Start playing when the user dismisses the intro screen (guaranteed user gesture).
    const handleIntroOk = () => {
      if (!enabledRef.current) {
        setEnabled(true);
        enabledRef.current = true;
        localStorage.setItem(STORAGE_KEY, 'true');
      }
      audio.play().catch(() => {});
    };
    document.addEventListener('intro-ok', handleIntroOk);

    return () => {
      if (autoResumeRef.current) {
        document.removeEventListener('click', autoResumeRef.current);
        document.removeEventListener('touchstart', autoResumeRef.current);
      }
      document.removeEventListener('omen-audio-start', handleOmenStart);
      document.removeEventListener('omen-audio-stop', handleOmenStop);
      document.removeEventListener('intro-ok', handleIntroOk);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const toggle = useCallback(() => {
    // Cancel pending auto-resume so it doesn't race with the toggle intent
    if (autoResumeRef.current) {
      document.removeEventListener('click', autoResumeRef.current);
      document.removeEventListener('touchstart', autoResumeRef.current);
      autoResumeRef.current = null;
    }

    const audio = audioRef.current;
    if (!audio) return;

    setEnabled(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      if (next) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
      return next;
    });
  }, []);

  if (!ready) return null;

  return (
    <button
      onClick={toggle}
      className="audio-toggle"
      data-active={String(enabled)}
      aria-label={enabled ? 'Silence the room' : 'Sound the room'}
    >
      {enabled ? 'silence the room' : 'sound the room'}
    </button>
  );
}
