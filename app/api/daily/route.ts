import { fetchOmenSheet, selectOmenRow } from '@/lib/omenSheet';
import { enrichFromDeezer } from '@/lib/omenDeezer';
import { getCurrentDayKey } from '@/lib/resetTime';
import { fetchScheduledPool, selectScheduledRow, fetchMultiPool } from '@/lib/songPool';

// Deterministic index from date string — same date always picks same track.
function hashDateToIndex(date: string, size: number): number {
  let h = 0;
  for (const c of date) h = (h * 31 + c.charCodeAt(0)) % size;
  return Math.abs(h) % size;
}

export async function GET() {
  const key = getCurrentDayKey();

  // Level 1: Multiplayer tab with scheduled_date column
  try {
    const scheduled = await fetchScheduledPool();
    const match = selectScheduledRow(scheduled, key);
    if (match) {
      const entry = await enrichFromDeezer(match.deezerTrackUrl, match.answerYear, key);
      if (entry) {
        if (match.entryNumber !== undefined) entry.entryNumber = match.entryNumber;
        if (!entry.audioOmen.audioUrl) return Response.json({ entry, reason: 'no_preview' });
        return Response.json({ entry });
      }
    }
  } catch {}

  // Level 2: Manual daily sheet (backwards compat)
  try {
    const rows = await fetchOmenSheet();
    const row = selectOmenRow(rows, key);
    if (row) {
      const entry = await enrichFromDeezer(row.deezerTrackUrl, row.answerYear, key);
      if (entry) {
        if (!entry.audioOmen.audioUrl) return Response.json({ entry, reason: 'no_preview' });
        return Response.json({ entry });
      }
    }
  } catch {}

  // Level 3: Deterministic hash over full pool — guarantees a song for every date
  try {
    const pool = await fetchMultiPool();
    if (pool.length > 0) {
      const row = pool[hashDateToIndex(key, pool.length)];
      const entry = await enrichFromDeezer(row.deezerTrackUrl, row.answerYear, key);
      if (entry) {
        if (!entry.audioOmen.audioUrl) return Response.json({ entry, reason: 'no_preview' });
        return Response.json({ entry });
      }
    }
  } catch {}

  return Response.json({ entry: null, reason: 'no_entry' });
}
