'use client';

import Link from 'next/link';
import { COPY } from '@/lib/copy';
import { getNextResetTimestamp } from '@/lib/resetTime';
import type { AudioOmenEntry, OmenLocalState } from '@/lib/omenTypes';
import ArtifactCover from '@/components/ui/ArtifactCover';
import Countdown from './Countdown';

interface Props {
  entry: AudioOmenEntry;
  omenState: OmenLocalState;
}

export default function AlbumReveal({ entry, omenState }: Props) {
  const solvedYear = omenState.guesses.find(g => g.correct)?.year;
  const { album, track, audioOmen } = entry;

  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Success copy */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <p className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text)' }}>
          The Omen Was Placed
        </p>
        <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.65 }}>
          The year is named. The record accepts you.
        </p>
      </div>

      {/* Year confirmation */}
      {solvedYear !== undefined && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            You Named
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

        {track?.title && (
          <>
            <span className="meta-key font-heading">Track</span>
            <span className="meta-val">{track.title}</span>
          </>
        )}
      </div>

      {/* Deezer CTA */}
      <a
        href={album.deezerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary font-heading"
      >
        {COPY.listenOnDeezer}
      </a>

      {/* Scars */}
      {omenState.guesses.length > 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Scars
          </p>
          {omenState.guesses.filter(g => !g.correct).map((g, i) => {
            const bandDir = g.band && g.direction
              ? `${g.band}, ${g.direction === 'UNBORN' ? 'before the birth' : 'after the burial'}`
              : '';
            return (
              <p key={i} className="font-heading" style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                {g.year} — {bandDir}
              </p>
            );
          })}
        </div>
      )}

      {/* Next record countdown */}
      <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', textAlign: 'center' }}>
        <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          {COPY.nextRecordLabel}
        </p>
        <Countdown targetTimestamp={getNextResetTimestamp()} className="countdown" />
        <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          07:00 UTC
        </p>
      </div>

      {/* Archive link */}
      <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
        <Link
          href="/archive"
          className="font-heading"
          style={{ fontSize: '0.52rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none', borderBottom: '1px solid var(--border-mid)', paddingBottom: '1px', transition: 'color 0.15s, border-color 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-mid)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-hi)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-dim)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-mid)'; }}
        >
          See past omens
        </Link>
      </div>

    </div>
  );
}
