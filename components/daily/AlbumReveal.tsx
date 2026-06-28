'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import { COPY } from '@/lib/copy';
import { shareOrCopy } from '@/lib/share';
import { consumePendingOmenAudio } from '@/lib/omenAudio';
import type { AudioOmenEntry, OmenLocalState } from '@/lib/omenTypes';
import ArtifactCover from '@/components/ui/ArtifactCover';
import EmailCapture from './EmailCapture';

interface Props {
  entry: AudioOmenEntry;
  omenState: OmenLocalState;
  practiceMode?: boolean;
  onNext?: () => void;
}

export default function AlbumReveal({ entry, omenState, practiceMode = false, onNext }: Props) {
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rescuedAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Pick up the audio that OmenCard started within the user gesture context.
    // rescuedAudio handles Strict Mode double-invoke (cleanup pauses, re-mount resumes).
    const pending = rescuedAudio.current
      ? { audio: rescuedAudio.current, alreadyFailed: false }
      : consumePendingOmenAudio();
    rescuedAudio.current = null;

    if (pending && !pending.alreadyFailed && !pending.audio.error) {
      const { audio } = pending;
      audioRef.current = audio;
      if (audio.paused && !audio.ended) {
        audio.play().catch(() => {});
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        rescuedAudio.current = audioRef.current;
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const solvedYear = omenState.guesses.find(g => g.correct)?.year;
  const failed = !omenState.solved;
  const { album, track: entryTrack, audioOmen } = entry;

  const handleShare = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.origin : '';
    const result = await shareOrCopy(url);
    if (result !== 'failed') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      track('result_shared', { outcome: failed ? 'failure' : 'success', method: result });
    }
  }, [failed]);

  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Year confirmation — only on success */}
      {solvedYear !== undefined && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <p className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Correct Guess
          </p>
          <p style={{ fontSize: '2rem', letterSpacing: '0.08em', color: 'var(--text)', lineHeight: 1 }}>
            {solvedYear}
          </p>
        </div>
      )}

      {/* Editorial note if available */}
      {album.editorialNote && (
        <p className="editorial">{album.editorialNote}</p>
      )}

      {/* Album cover */}
      <ArtifactCover
        src={album.coverImageUrl ?? ''}
        alt={`${album.title} by ${album.artist}`}
        entryNumber={entry.entryNumber ?? 1}
        date={entry.dateUtc}
      />

      {/* Album metadata */}
      <div className="meta-table">
        <span className="meta-key font-heading">Artist</span>
        <span className="meta-val">{album.artist}</span>

        <span className="meta-key font-heading">Album</span>
        <span className="meta-val">{album.title}</span>

        <span className="meta-key font-heading">Year</span>
        <span className="meta-val">{audioOmen.answerYear}</span>

        {entryTrack?.title && (
          <>
            <span className="meta-key font-heading">Track</span>
            <span className="meta-val">{entryTrack.title}</span>
          </>
        )}
      </div>

      {/* DSP buttons — grouped tighter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <a
          href={album.deezerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary font-heading"
          aria-label={COPY.listenOnDeezer}
        >
          {COPY.listenOnDeezer}
        </a>
        <a
          href="https://en.wikipedia.org/wiki/Controversy_over_fake_artists_on_Spotify"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost font-heading"
          style={{ textAlign: 'center' }}
        >
          Listen on Spotify
        </a>
      </div>

      {/* Scars — wrong guesses */}
      {omenState.guesses.filter(g => !g.correct).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Scars
          </p>
          {omenState.guesses.filter(g => !g.correct).map((g, i) => {
            const bandDir = g.band && g.direction
              ? `${g.band}, ${g.direction === 'UNBORN' ? 'before the birth' : 'after the burial'}`
              : '';
            return (
              <p key={i} className="font-heading" style={{ fontSize: '0.86rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                {g.year} — {bandDir}
              </p>
            );
          })}
        </div>
      )}

      {/* Share */}
      <button
        onClick={handleShare}
        className="btn-ghost"
        style={{ marginTop: '0.5rem' }}
      >
        {copied ? 'Copied!' : 'Share the game'}
      </button>

      {/* Email capture / auth status — not shown in practice mode */}
      {!practiceMode && <EmailCapture />}

      {/* Next song — practice mode only */}
      {onNext && (
        <button onClick={onNext} className="btn-ghost">
          Next song
        </button>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.5rem' }}>
        <Link
          href="/"
          className="font-heading"
          style={{ fontSize: '0.84rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none', borderBottom: '1px solid var(--border-mid)', paddingBottom: '1px' }}
        >
          Exit to menu
        </Link>
      </div>

    </div>
  );
}
