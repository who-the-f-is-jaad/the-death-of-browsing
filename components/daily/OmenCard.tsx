'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { AudioOmenEntry, OmenLocalState, CurrentAttemptStatus, OmenGuess } from '@/lib/omenTypes';
import { getOmenFeedback, getOmenFeedbackCopy } from '@/lib/omenFeedback';

const MAX_ATTEMPTS = 3;
const CURRENT_YEAR = new Date().getFullYear();

interface Props {
  entry: AudioOmenEntry;
  omenState: OmenLocalState;
  onMarkSpent: (updated: OmenLocalState) => void;
  onGuessSubmit: (year: number, updated: OmenLocalState, correct: boolean) => void;
}

export default function OmenCard({ entry, omenState, onMarkSpent, onGuessSubmit }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [attempt, setAttempt] = useState<CurrentAttemptStatus>(() => ({
    hasSpentMark: omenState.currentAttemptHeard,
    canGuess: omenState.currentAttemptHeard,
    audioStatus: omenState.currentAttemptHeard ? 'ended' : 'idle',
  }));
  const [yearValue, setYearValue] = useState('');
  const [yearError, setYearError] = useState<string | null>(null);
  const [lastFeedback, setLastFeedback] = useState<OmenGuess | null>(
    omenState.guesses.length > 0 ? omenState.guesses[omenState.guesses.length - 1] : null
  );

  const attemptsSpent = omenState.attemptsSpent;
  const marksRemaining = MAX_ATTEMPTS - attemptsSpent;
  const canHear = !attempt.hasSpentMark && marksRemaining > 0;
  const inputActive = attempt.hasSpentMark;

  useEffect(() => {
    // Stop background music as soon as the omen screen appears
    document.dispatchEvent(new CustomEvent('omen-audio-start'));

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      // Resume background music when leaving the omen screen
      document.dispatchEvent(new CustomEvent('omen-audio-stop'));
    };
  }, []);

  const handleHearOmen = useCallback(() => {
    if (!canHear) return;

    const next: OmenLocalState = {
      ...omenState,
      attemptsSpent: omenState.attemptsSpent + 1,
      currentAttemptHeard: true,
    };
    onMarkSpent(next);
    setLastFeedback(null);

    if (!entry.audioOmen.audioUrl) {
      setAttempt({ hasSpentMark: true, canGuess: true, audioStatus: 'error' });
      return;
    }

    document.dispatchEvent(new CustomEvent('omen-audio-start'));

    const audio = new Audio(entry.audioOmen.audioUrl);
    audio.preload = 'none';
    audioRef.current = audio;

    audio.addEventListener('ended', () => {
      setAttempt({ hasSpentMark: true, canGuess: true, audioStatus: 'ended' });
    });
    audio.addEventListener('error', () => {
      setAttempt({ hasSpentMark: true, canGuess: true, audioStatus: 'error' });
    });

    audio.play().catch(() => {
      setAttempt({ hasSpentMark: true, canGuess: true, audioStatus: 'error' });
    });
    setAttempt({ hasSpentMark: true, canGuess: true, audioStatus: 'playing' });
  }, [canHear, entry, omenState, onMarkSpent]);

  const handleYearSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = yearValue.trim();
    const year = parseInt(trimmed, 10);

    if (!trimmed || trimmed.length !== 4 || isNaN(year) || year < 1900 || year > CURRENT_YEAR) {
      setYearError('Enter a valid year.');
      return;
    }
    setYearError(null);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    const feedback = getOmenFeedback(year, entry.audioOmen.answerYear);
    const guess: OmenGuess = {
      year,
      band: feedback.band,
      direction: feedback.direction,
      correct: feedback.correct,
      attemptedAt: new Date().toISOString(),
    };

    const isLastAttempt = attemptsSpent >= MAX_ATTEMPTS;
    const lockedUntil = (!feedback.correct && isLastAttempt)
      ? new Date(Date.now() + 60 * 60 * 1000).toISOString()
      : omenState.lockedUntil;

    const next: OmenLocalState = {
      ...omenState,
      guesses: [...omenState.guesses, guess],
      solved: feedback.correct,
      solvedAt: feedback.correct ? new Date().toISOString() : omenState.solvedAt,
      currentAttemptHeard: false,
      lockedUntil,
    };

    onGuessSubmit(year, next, feedback.correct);
    setLastFeedback(guess);
    setYearValue('');
    setAttempt({ hasSpentMark: false, canGuess: false, audioStatus: 'idle' });
  }, [yearValue, entry, omenState, attemptsSpent, onGuessSubmit]);

  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Death mark symbols */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }} role="img" aria-label={`${marksRemaining} attempts remaining`}>
        {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
          const isDead = i < attemptsSpent || (i === attemptsSpent && attempt.hasSpentMark);
          return (
            <span
              key={i}
              aria-hidden="true"
              style={{
                fontSize: '1.3rem',
                lineHeight: 1,
                color: isDead ? 'var(--crimson)' : 'var(--text)',
                transition: 'color 0.25s',
                userSelect: 'none',
                fontFamily: "'IM Fell English', Georgia, serif",
              }}
            >
              †
            </span>
          );
        })}
        <span className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          {marksRemaining} {marksRemaining === 1 ? 'attempt' : 'attempts'} left
        </span>
      </div>

      {/* Hear button */}
      {canHear && (
        <button onClick={handleHearOmen} className="btn-ghost">
          Hear the Omen
        </button>
      )}

      {/* Playing indicator */}
      {attempt.audioStatus === 'playing' && (
        <p className="font-heading animate-pulse-gold" style={{ fontSize: '0.52rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Playing...
        </p>
      )}

      {/* Audio error */}
      {attempt.audioStatus === 'error' && (
        <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-mid)' }}>
          Audio unavailable. The attempt is spent — name the year anyway.
        </p>
      )}

      {/* Distance feedback — above the input */}
      {lastFeedback && !lastFeedback.correct && lastFeedback.band && lastFeedback.direction && (() => {
        const copy = getOmenFeedbackCopy(lastFeedback.band, lastFeedback.direction);
        return (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            padding: '1.5rem 0',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}>
            <p className="font-heading" style={{
              fontSize: '1.5rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--text)',
              lineHeight: 1.1,
            }}>
              {copy.title}
            </p>
            <p style={{
              fontStyle: 'italic',
              fontSize: '1rem',
              color: 'var(--text-mid)',
              lineHeight: 1.7,
            }}>
              {copy.body}
            </p>
            <p className="font-heading" style={{
              fontSize: '0.5rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
              marginTop: '0.25rem',
            }}>
              {lastFeedback.year} — {lastFeedback.band} — {lastFeedback.direction === 'UNBORN' ? 'Too early' : 'Too late'}
            </p>
          </div>
        );
      })()}

      {/* Year input — centered 4-digit box */}
      {inputActive && (
        <form onSubmit={handleYearSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <input
              ref={(el) => { if (el) setTimeout(() => el.focus(), 60); }}
              id="omen-year"
              aria-label="Year"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              autoComplete="off"
              value={yearValue}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setYearValue(val);
                setYearError(null);
              }}
              placeholder="1979"
              className="ritual-input"
              style={{
                width: '8rem',
                textAlign: 'center',
                fontSize: '2.2rem',
                letterSpacing: '0.15em',
                padding: '0.4rem 0',
              }}
            />
          </div>
          {yearError && (
            <p className="font-heading" style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--crimson-hi)', textAlign: 'center' }}>
              {yearError}
            </p>
          )}
          <button type="submit" disabled={yearValue.length < 4} className="btn-ghost">
            Confirm
          </button>
        </form>
      )}

      {/* Scars — previous guesses */}
      {omenState.guesses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Scars
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {omenState.guesses.map((g, i) => {
              const bandDirection = g.band && g.direction
                ? `${g.band} — ${g.direction === 'UNBORN' ? 'too early' : 'too late'}`
                : g.correct ? 'named' : '—';
              return (
                <p key={i} className="font-heading" style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                  {g.year} — {bandDirection}
                </p>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
