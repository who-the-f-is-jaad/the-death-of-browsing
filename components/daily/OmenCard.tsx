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
  // Input available as soon as the mark is spent — user can type during playback
  const inputActive = attempt.hasSpentMark;

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
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
    // Mark spent + input unlocked immediately; audio starts in background
    setAttempt({ hasSpentMark: true, canGuess: true, audioStatus: 'playing' });
  }, [canHear, entry, omenState, onMarkSpent]);

  const handleYearSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = yearValue.trim();
    const year = parseInt(trimmed, 10);

    if (!trimmed || trimmed.length !== 4 || isNaN(year) || year < 1900 || year > CURRENT_YEAR) {
      setYearError('A YEAR HAS FOUR DIGITS.');
      return;
    }
    setYearError(null);

    // Stop audio if still playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    document.dispatchEvent(new CustomEvent('omen-audio-stop'));

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

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <p className="font-heading" style={{ fontSize: '0.58rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          The Omen
        </p>
        <p className="font-heading" style={{ fontSize: '0.55rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          The year must be named exactly.
        </p>
      </div>

      {/* Marks */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="marks" role="img" aria-label={`${marksRemaining} marks remaining`}>
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
            const isSpent = i < attemptsSpent;
            const isCurrent = i === attemptsSpent && attempt.hasSpentMark;
            return (
              <span
                key={i}
                className={`mark ${isSpent || isCurrent ? 'mark--dead' : 'mark--live'}`}
                aria-hidden="true"
              />
            );
          })}
        </div>
        <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          {marksRemaining} {marksRemaining === 1 ? 'mark' : 'marks'} remaining
        </p>
      </div>

      {/* Hear button */}
      {canHear && (
        <button
          onClick={handleHearOmen}
          className="btn-ghost"
        >
          Hear the Omen
        </button>
      )}

      {/* Playing indicator — subtle, doesn't block input */}
      {attempt.audioStatus === 'playing' && (
        <p
          className="font-heading animate-pulse-gold"
          style={{ fontSize: '0.52rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}
        >
          The omen sounds...
        </p>
      )}

      {/* Audio error */}
      {attempt.audioStatus === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <p className="font-heading" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--crimson-hi)' }}>
            The Omen Failed to Sound.
          </p>
          <p style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-mid)' }}>
            The mark is spent. Name the year anyway.
          </p>
        </div>
      )}

      {/* Year form — available as soon as mark is spent */}
      {inputActive && (
        <form onSubmit={handleYearSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label
              htmlFor="omen-year"
              className="font-heading"
              style={{ fontSize: '0.52rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}
            >
              Name the Year
            </label>
            <input
              ref={(el) => { if (el && inputActive) setTimeout(() => el.focus(), 60); }}
              id="omen-year"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              autoComplete="off"
              value={yearValue}
              onChange={e => { setYearValue(e.target.value); setYearError(null); }}
              placeholder="1979"
              className="ritual-input"
              style={{ fontSize: '1.4rem', letterSpacing: '0.1em' }}
            />
            {yearError && (
              <p className="font-heading" style={{ fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--crimson-hi)' }}>
                {yearError}
              </p>
            )}
          </div>
          <button type="submit" disabled={!yearValue.trim()} className="btn-ghost">
            Name the Year
          </button>
        </form>
      )}

      {/* Distance feedback — large and prominent */}
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

      {/* Scars */}
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
                <p
                  key={i}
                  className="font-heading"
                  style={{ fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}
                >
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
