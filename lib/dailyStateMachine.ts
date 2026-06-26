// State machine for the daily ritual experience.
// Pure functions: each takes a DailyProgress and returns a new one.
// No side effects; persistence happens in the calling component.

import type { DailyProgress, DailyState, Attempt } from './types';

export const MAX_ATTEMPTS_PER_WINDOW = 3;
export const SOFT_LOCK_DURATION_MS = 60 * 60 * 1000; // 60 minutes

// ── Predicates ──────────────────────────────────────────────────────────────

export function isSoftLockActive(progress: DailyProgress): boolean {
  if (!progress.softLockExpiresAt) return false;
  return Date.now() < progress.softLockExpiresAt;
}

/**
 * Returns the state the UI should render.
 * Expired soft locks are auto-reset at page load in the app; the state here
 * reflects exactly what is stored so SoftLockPanel can show its own
 * "Begin again" button when the countdown hits zero.
 */
export function getEffectiveState(progress: DailyProgress): DailyState {
  return progress.state;
}

// ── Transitions ─────────────────────────────────────────────────────────────

/** sealed -> riddle_active */
export function applyOpenRiddle(progress: DailyProgress): DailyProgress {
  return { ...progress, state: 'riddle_active' };
}

/** riddle_active -> riddle_error or soft_locked */
export function applyWrongAnswer(
  progress: DailyProgress,
  normalizedInput: string,
): DailyProgress {
  const attempt: Attempt = {
    normalizedInput,
    correct: false,
    timestamp: Date.now(),
  };

  const newWindow = progress.attemptsInCurrentWindow + 1;

  if (newWindow >= MAX_ATTEMPTS_PER_WINDOW) {
    return {
      ...progress,
      attempts: [...progress.attempts, attempt],
      attemptsInCurrentWindow: newWindow,
      state: 'soft_locked',
      softLockExpiresAt: Date.now() + SOFT_LOCK_DURATION_MS,
    };
  }

  return {
    ...progress,
    attempts: [...progress.attempts, attempt],
    attemptsInCurrentWindow: newWindow,
    state: 'riddle_error',
  };
}

/** riddle_active -> unlocking */
export function applyCorrectAnswer(
  progress: DailyProgress,
  normalizedInput: string,
): DailyProgress {
  const attempt: Attempt = {
    normalizedInput,
    correct: true,
    timestamp: Date.now(),
  };

  return {
    ...progress,
    attempts: [...progress.attempts, attempt],
    state: 'unlocking',
    solvedAt: Date.now(),
  };
}

/** unlocking -> unlocked (called when animation finishes) */
export function applyUnlockComplete(progress: DailyProgress): DailyProgress {
  return { ...progress, state: 'unlocked' };
}

/** soft_locked (expired) -> riddle_active, resets window counter */
export function applyRetryAfterSoftLock(progress: DailyProgress): DailyProgress {
  return {
    ...progress,
    state: 'riddle_active',
    attemptsInCurrentWindow: 0,
    softLockExpiresAt: null,
  };
}

/**
 * Returns which error message to display (0-indexed, max 2).
 * Indexes map to COPY.riddleErrors entries.
 */
export function getErrorMessageIndex(attemptsInWindow: number): number {
  return Math.min(Math.max(attemptsInWindow - 1, 0), 2);
}

/** How many attempts remain in the current window before a soft lock. */
export function attemptsRemaining(progress: DailyProgress): number {
  return Math.max(0, MAX_ATTEMPTS_PER_WINDOW - progress.attemptsInCurrentWindow);
}
