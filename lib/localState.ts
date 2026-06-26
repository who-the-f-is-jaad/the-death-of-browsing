// Local (pre-login) state persistence via localStorage.
// TODO: After Supabase auth is integrated, merge local state into the user
//       account on first login and keep localStorage as a write-through cache.

import type { DailyProgress, DailyState, StreakData } from './types';

const PROGRESS_PREFIX = 'tdb:progress:';
const STREAK_KEY = 'tdb:streak';

function progressKey(entryDate: string): string {
  return PROGRESS_PREFIX + entryDate;
}

// ── Daily progress ───────────────────────────────────────────────────────────

export function loadProgress(entryDate: string): DailyProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(progressKey(entryDate));
    if (!raw) return null;
    return JSON.parse(raw) as DailyProgress;
  } catch {
    return null;
  }
}

export function saveProgress(progress: DailyProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(progressKey(progress.entryDate), JSON.stringify(progress));
  } catch {
    // Silently fail if localStorage is unavailable (private browsing quota, etc.)
  }
}

export function initProgress(entryDate: string): DailyProgress {
  return {
    entryDate,
    state: 'sealed' as DailyState,
    attempts: [],
    attemptsInCurrentWindow: 0,
    softLockExpiresAt: null,
    solvedAt: null,
  };
}

export function loadOrInitProgress(entryDate: string): DailyProgress {
  return loadProgress(entryDate) ?? initProgress(entryDate);
}

// ── Streak ───────────────────────────────────────────────────────────────────

const EMPTY_STREAK: StreakData = { current: 0, longest: 0, lastSolvedDate: null };

export function loadStreak(): StreakData {
  if (typeof window === 'undefined') return { ...EMPTY_STREAK };
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { ...EMPTY_STREAK };
    return JSON.parse(raw) as StreakData;
  } catch {
    return { ...EMPTY_STREAK };
  }
}

export function saveStreak(streak: StreakData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch {}
}
