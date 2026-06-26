// Daily reset fires at 07:00 UTC, branded as "Midnight on the Dead Wax Meridian".

export const RESET_HOUR_UTC = 7;

/**
 * Returns the current "day key" as YYYY-MM-DD (UTC), accounting for the
 * 07:00 UTC reset. Before 07:00 UTC, the active day is still yesterday.
 */
export function getCurrentDayKey(): string {
  const now = new Date();
  if (now.getUTCHours() < RESET_HOUR_UTC) {
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return yesterday.toISOString().slice(0, 10);
  }
  return now.toISOString().slice(0, 10);
}

/** Returns the epoch ms timestamp of the next 07:00 UTC reset. */
export function getNextResetTimestamp(): number {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(RESET_HOUR_UTC, 0, 0, 0);
  if (now.getUTCHours() >= RESET_HOUR_UTC) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next.getTime();
}

/** Returns ms remaining until the next reset. */
export function getMsUntilNextReset(): number {
  return Math.max(0, getNextResetTimestamp() - Date.now());
}

/**
 * Returns the day key for the calendar day immediately before the given key.
 * Uses 07:00 UTC anchor so the arithmetic stays in UTC.
 */
export function getPreviousDayKey(dayKey: string): string {
  const d = new Date(dayKey + 'T07:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
