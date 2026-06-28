'use client';

type RevealEntry = {
  roundIndex: number;
  answerYear: number;
  albumTitle: string;
  artist: string;
  coverImageUrl: string;
  deezerAlbumUrl: string;
  trackTitle?: string;
};

interface Props {
  entry: RevealEntry;
  score: number | null;
}

export default function RoundReveal({ entry, score }: Props) {
  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '0.5rem' }}>

      <div>
        <p className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
          Round {entry.roundIndex + 1} · Revealed
        </p>
        <p className="font-brand" style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 0.9, color: 'var(--text)' }}>
          {entry.answerYear}
        </p>
      </div>

      {/* Album cover */}
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

      {/* Track info */}
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

      {/* Your score this round */}
      {score !== null && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', textAlign: 'center' }}>
          <p className="font-heading" style={{ fontSize: '0.76rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
            Your score
          </p>
          <p className="font-brand" style={{ fontSize: '2.5rem', fontWeight: 700, color: score > 0 ? 'var(--text)' : '#c41a1a', lineHeight: 1 }}>
            {score}
          </p>
          <p className="font-heading" style={{ fontSize: '0.74rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            pts
          </p>
        </div>
      )}

      <p style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
        Next round starting…
      </p>

    </div>
  );
}
