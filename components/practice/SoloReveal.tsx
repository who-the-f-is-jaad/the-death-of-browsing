'use client';

import AnimatedScore from '@/components/ui/AnimatedScore';

interface SoloEntry {
  audioUrl: string;
  answerYear: number;
  albumTitle: string;
  artist: string;
  coverImageUrl?: string;
  deezerAlbumUrl: string;
  trackTitle?: string;
}

interface Props {
  roundIndex: number;
  entry: SoloEntry;
  guessedYear: number;
  score: number;
  isLast: boolean;
  onNext: () => void;
}

export default function SoloReveal({ roundIndex, entry, guessedYear, score, isLast, onNext }: Props) {
  const noAnswer = guessedYear === 0;
  const exact = !noAnswer && guessedYear === entry.answerYear;

  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '0.5rem' }}>

      <div>
        <p className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
          Round {roundIndex + 1} · Revealed
        </p>
        <p className="font-brand" style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 0.9, color: 'var(--text)' }}>
          {entry.answerYear}
        </p>
      </div>

      {entry.coverImageUrl && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="photo-frame" style={{ width: '72%' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.coverImageUrl}
              alt={`${entry.albumTitle} cover`}
              style={{ width: '100%', display: 'block' }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {entry.trackTitle && (
          <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
            &ldquo;{entry.trackTitle}&rdquo;
          </p>
        )}
        <p className="font-heading" style={{ fontSize: '1rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)' }}>
          {entry.artist}
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)' }}>
          {entry.albumTitle}
        </p>
        <a
          href={entry.deezerAlbumUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-heading"
          style={{ fontSize: '0.76rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.25rem' }}
        >
          Open on Deezer →
        </a>
      </div>

      {/* Your guess vs correct */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ display: 'flex', gap: '0', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <p className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
              You guessed
            </p>
            <p className="font-brand" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, color: noAnswer ? 'var(--text-dim)' : exact ? 'var(--gold)' : '#c41a1a' }}>
              {noAnswer ? '—' : guessedYear}
            </p>
          </div>
          <div style={{ width: '1px', background: 'var(--border)' }} />
          <div style={{ textAlign: 'center' }}>
            <p className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
              Correct
            </p>
            <p className="font-brand" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, color: 'var(--text)' }}>
              {entry.answerYear}
            </p>
          </div>
        </div>
        {exact && (
          <p className="font-heading animate-exact" style={{ fontSize: '0.72rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--text)', textAlign: 'center' }}>
            — exact year —
          </p>
        )}
      </div>

      {/* Score */}
      <div style={{ textAlign: 'center' }}>
        <p className="font-heading" style={{ fontSize: '0.76rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
          Your score
        </p>
        <p className="font-brand" style={{ fontSize: '2.5rem', fontWeight: 700, color: score > 0 ? 'var(--text)' : '#c41a1a', lineHeight: 1 }}>
          <AnimatedScore target={score} />
        </p>
        <p className="font-heading" style={{ fontSize: '0.74rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
          pts
        </p>
      </div>

      <div style={{ paddingTop: '0.5rem' }}>
        <button onClick={onNext} className="btn-ghost" style={{ width: '100%' }}>
          {isLast ? 'See results' : 'Next round →'}
        </button>
      </div>

    </div>
  );
}
