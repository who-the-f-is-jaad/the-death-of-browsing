'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/classNames';
import { COPY } from '@/lib/copy';
import { MAX_ATTEMPTS_PER_WINDOW } from '@/lib/dailyStateMachine';
import type { DailyEntry, DailyState } from '@/lib/types';

interface Props {
  entry: DailyEntry;
  state: Extract<DailyState, 'riddle_active' | 'riddle_error'>;
  attemptsInWindow: number;
  errorMessageIndex: number;
  onSubmit: (raw: string) => void;
}

export default function RiddleCard({
  entry,
  state,
  attemptsInWindow,
  errorMessageIndex,
  onSubmit,
}: Props) {
  const [value, setValue] = useState('');
  const [hintIndex, setHintIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const isError = state === 'riddle_error';
  const remaining = Math.max(0, MAX_ATTEMPTS_PER_WINDOW - attemptsInWindow);

  useEffect(() => {
    if (state === 'riddle_active') {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  };

  const visibleHints = entry.hints.slice(0, hintIndex + 1);
  const hasMoreHints = hintIndex < entry.hints.length - 1;

  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Inscription block ────────────────────────────────────────────── */}
      <div className="inscription">
        {/* Label + attempt marks */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span
            className="font-heading"
            style={{ fontSize: '0.84rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}
          >
            {COPY.riddleLabel}
          </span>

          <div className="marks" role="img" aria-label={COPY.attemptsRemaining(remaining)}>
            {Array.from({ length: MAX_ATTEMPTS_PER_WINDOW }).map((_, i) => {
              const isUsed = i < attemptsInWindow;
              const isLast = !isUsed && remaining === 1 && i === attemptsInWindow;
              return (
                <span
                  key={i}
                  className={cn('mark', isUsed ? 'mark--dead' : isLast ? 'mark--last' : 'mark--live')}
                  aria-hidden="true"
                />
              );
            })}
          </div>
        </div>

        {/* Riddle text */}
        <p style={{ fontStyle: 'italic', fontSize: '1rem', lineHeight: 1.75, color: 'var(--text)' }}>
          {entry.riddle}
        </p>

        {/* Error message */}
        {isError && (
          <p
            style={{ marginTop: '0.75rem', fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--crimson-hi)' }}
            role="alert"
            aria-live="assertive"
          >
            {COPY.riddleErrors[errorMessageIndex]}
          </p>
        )}

        {/* Marginalia hints */}
        {visibleHints.length > 0 && (
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {visibleHints.map((hint, i) => (
              <p
                key={i}
                style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.6 }}
              >
                <span
                  className="font-heading"
                  style={{ fontStyle: 'normal', fontSize: '0.82rem', letterSpacing: '0.15em', color: 'var(--text-dim)' }}
                >
                  clue {i + 1} —{' '}
                </span>
                {hint}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* ── Answer form ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label
            htmlFor="riddle-answer"
            className="font-heading"
            style={{ fontSize: '0.84rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}
          >
            {COPY.riddleInputLabel}
          </label>
          <input
            ref={inputRef}
            id="riddle-answer"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={COPY.riddleInputPlaceholder}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="ritual-input"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          {hasMoreHints ? (
            <button
              type="button"
              className="btn-text"
              onClick={() => setHintIndex(i => Math.min(i + 1, entry.hints.length - 1))}
            >
              {COPY.riddleHintReveal}
            </button>
          ) : (
            <span />
          )}

          <span
            className="font-heading"
            style={{
              fontSize: '0.82rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: remaining <= 1 ? 'var(--crimson-hi)' : 'var(--text-dim)',
            }}
          >
            {COPY.attemptsRemaining(remaining)}
          </span>
        </div>

        <button type="submit" disabled={!value.trim()} className="btn-ghost">
          {COPY.riddleSubmitLabel}
        </button>
      </form>

    </div>
  );
}
