import type { StreakData } from './types';
import { getPreviousDayKey } from './resetTime';

/**
 * Updates streak state after a successful solve.
 * The streak increments only if the user also solved yesterday's entry.
 * Otherwise it resets to 1.
 */
export function updateStreakOnSolve(
  current: StreakData,
  solvedDate: string,
): StreakData {
  const yesterday = getPreviousDayKey(solvedDate);
  const isConsecutive = current.lastSolvedDate === yesterday;

  const newCurrent = isConsecutive ? current.current + 1 : 1;
  return {
    current: newCurrent,
    longest: Math.max(current.longest, newCurrent),
    lastSolvedDate: solvedDate,
  };
}

/**
 * Returns true if the streak is still live, i.e., the user solved either
 * today or yesterday relative to the provided day key.
 * A streak is considered broken only when they miss a full day.
 */
export function isStreakAlive(streak: StreakData, todayKey: string): boolean {
  if (!streak.lastSolvedDate || streak.current === 0) return false;
  const yesterday = getPreviousDayKey(todayKey);
  return (
    streak.lastSolvedDate === todayKey ||
    streak.lastSolvedDate === yesterday
  );
}
