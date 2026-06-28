'use client';

interface SoloEntry {
  answerYear: number;
  albumTitle: string;
  artist: string;
}

interface CompletedRound {
  entry: SoloEntry;
  guessedYear: number;
  score: number;
}

interface Props {
  rounds: CompletedRound[];
  onPlayAgain: () => void;
}

export default function SoloFinished({ rounds, onPlayAgain }: Props) {
  const totalScore = rounds.reduce((sum, r) => sum + r.score, 0);
  const maxScore = rounds.length * 1000;

  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '0.5rem' }}>

      <div>
        <p className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
          Final score
        </p>
        <p className="font-brand" style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 0.9, color: 'var(--text)' }}>
          {totalScore}
        </p>
        <p className="font-heading" style={{ fontSize: '0.74rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
          out of {maxScore}
        </p>
      </div>

      {/* Round breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)' }}>
        {rounds.map((r, i) => {
          const noAnswer = r.guessedYear === 0;
          const diff = noAnswer ? null : r.guessedYear - r.entry.answerYear;
          const diffLabel = diff === null ? '—' : diff === 0 ? 'exact' : diff > 0 ? `+${diff}` : `${diff}`;
          return (
            <div
              key={i}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', gap: '0.75rem' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="font-heading" style={{ fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.entry.artist}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.1rem' }}>
                  {r.entry.answerYear}
                  <span style={{ marginLeft: '0.5rem', color: diff === 0 ? 'var(--gold)' : 'var(--text-dim)', opacity: diff === 0 ? 1 : 0.7 }}>
                    ({diffLabel})
                  </span>
                </p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.06em', color: r.score > 0 ? 'var(--text)' : '#c41a1a' }}>
                  {r.score} pts
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.1rem' }}>
                  {noAnswer ? 'no answer' : `guessed ${r.guessedYear}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={onPlayAgain} className="btn-ghost" style={{ width: '100%' }}>
        Play again
      </button>

    </div>
  );
}
