import type { OmenLocalState } from './omenTypes';

const STORAGE_KEY = 'death-of-browsing-omen-state-v1';

export function initOmenState(entryId: string): OmenLocalState {
  return {
    entryId,
    opened: false,
    solved: false,
    attemptsSpent: 0,
    guesses: [],
    currentAttemptHeard: false,
  };
}

export function loadOmenState(entryId: string): OmenLocalState {
  if (typeof window === 'undefined') return initOmenState(entryId);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initOmenState(entryId);
    const parsed = JSON.parse(raw) as OmenLocalState;
    // If entry changed, start fresh
    if (parsed.entryId !== entryId) return initOmenState(entryId);
    return parsed;
  } catch {
    return initOmenState(entryId);
  }
}

export function saveOmenState(state: OmenLocalState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}
