'use client';
import AnimatedScore from '@/components/ui/AnimatedScore';

type PlayerGuess = { nickname: string; year: number; score: number; correct: boolean };

type RevealEntry = {
  roundIndex: number;
  answerYear: number;
  albumTitle: string;
  artist: string;
  coverImageUrl: string;
  deezerAlbumUrl: string;
  trackTitle?: string;
  playerGuesses?: PlayerGuess[];
};

interface Props {
  entry: RevealEntry;
  score: number | null;
  myYear: number | null;
  myNickname: string | null;
  isHost: boolean;
  countdown: number | null;
  onReady: () => void;
}

export default function RoundReveal({ entry, score, myYear, myNickname, isHost, countdown, onReady }: Props) {
  const guesses = entry.playerGuesses ?? [];
  // If we have playerGuesses, derive myYear from there as fallback
  const resolvedMyYear = myYear ?? (myNickname ? (guesses.find(g => g.nickname === myNickname)?.year ?? null) : null);
  const isLast = entry.roundIndex !== undefined; // always true, just for clarity
  void isLast;

  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '0.5rem' }}>

      {/* Round header + answer year */}
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

      {/* Your guess vs correct answer */}
      {resolvedMyYear !== null && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', gap: '0', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <p className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
              You guessed
            </p>
            <p className="font-brand" style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, color: resolvedMyYear === entry.answerYear ? 'var(--gold)' : '#c41a1a' }}>
              {resolvedMyYear}
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
      )}

      {/* Your score this round */}
      {score !== null && (
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
      )}

      {/* All players this round */}
      {guesses.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <p className="font-heading" style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
            This round
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            {guesses.map((g, i) => {
              const isMe = myNickname && g.nickname === myNickname;
              return (
                <div
                  key={g.nickname}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.5rem',
                    background: isMe ? 'rgba(255,255,255,0.04)' : 'transparent',
                    borderRadius: '3px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="font-heading" style={{ fontSize: '0.64rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-dim)', width: '1rem', textAlign: 'right' }}>
                      {i + 1}
                    </span>
                    <span className="font-heading" style={{ fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: isMe ? 'var(--text)' : 'var(--text-mid)', fontWeight: isMe ? 700 : 400 }}>
                      {g.nickname}{isMe ? ' ★' : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <span style={{ fontSize: '0.82rem', color: g.correct ? 'var(--gold)' : 'var(--text-dim)', minWidth: '2.5rem', textAlign: 'right' }}>
                      {g.year}
                    </span>
                    <span className="font-heading" style={{ fontSize: '0.78rem', letterSpacing: '0.04em', color: g.score > 0 ? 'var(--text)' : 'var(--text-dim)', minWidth: '3.5rem', textAlign: 'right' }}>
                      {i === 0 ? <AnimatedScore target={g.score} duration={1100} /> : g.score} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Host "Ready" button or countdown */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', paddingTop: '0.5rem' }}>
        {countdown !== null ? (
          <>
            <p className="font-heading" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              Starting in
            </p>
            <p className="font-brand" style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 1, color: 'var(--text)' }}>
              {countdown}
            </p>
          </>
        ) : isHost ? (
          <button
            onClick={onReady}
            className="btn-ghost"
            style={{ minWidth: '10rem' }}
          >
            Ready
          </button>
        ) : (
          <p style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Waiting for host…
          </p>
        )}
      </div>

    </div>
  );
}
