'use client';

import { COPY } from '@/lib/copy';
import { getNextResetTimestamp } from '@/lib/resetTime';
import type { DailyEntry, Attempt } from '@/lib/types';
import DspLinks from './DspLinks';
import ShareButton from './ShareButton';
import Countdown from './Countdown';
import ArtifactCover from '@/components/ui/ArtifactCover';
import ListeningChamber from '@/components/ui/ListeningChamber';

interface Props {
  entry: DailyEntry;
  attempts: Attempt[];
}

export default function AlbumReveal({ entry, attempts }: Props) {
  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Album cover ──────────────────────────────────────────────────── */}
      <ArtifactCover
        src={entry.coverImageUrl}
        alt={`${entry.album} by ${entry.artist}`}
        entryNumber={entry.entryNumber}
        date={entry.date}
      />

      {/* ── Catalog metadata ─────────────────────────────────────────────── */}
      <div className="meta-table">
        <span className="meta-key font-heading">Artist</span>
        <span className="meta-val">{entry.artist}</span>

        <span className="meta-key font-heading">Album</span>
        <span className="meta-val">{entry.album}</span>

        <span className="meta-key font-heading">Year</span>
        <span className="meta-val">{entry.year}</span>

        <span className="meta-key font-heading">Genre</span>
        <span className="meta-val">{entry.genre}</span>
      </div>

      {/* ── Editorial note ────────────────────────────────────────────────── */}
      <p className="editorial">{entry.editorialNote}</p>

      {/* ── DSP links ─────────────────────────────────────────────────────── */}
      <DspLinks entry={entry} />

      {/* ── Listening chamber ─────────────────────────────────────────────── */}
      <ListeningChamber
        youtubeEmbedUrl={entry.youtubeEmbedUrl}
        albumTitle={entry.album}
        artist={entry.artist}
      />

      {/* ── Share ─────────────────────────────────────────────────────────── */}
      <ShareButton entryNumber={entry.entryNumber} attempts={attempts} solved={true} />

      {/* ── Next reset ────────────────────────────────────────────────────── */}
      <div
        style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          textAlign: 'center',
        }}
      >
        <p
          className="font-heading"
          style={{ fontSize: '0.5rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)' }}
        >
          {COPY.nextRecordLabel}
        </p>
        <Countdown targetTimestamp={getNextResetTimestamp()} className="countdown" />
        <p
          className="font-heading"
          style={{ fontSize: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}
        >
          {COPY.nextResetMeridian}
        </p>
      </div>

    </div>
  );
}
