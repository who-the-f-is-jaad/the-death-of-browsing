import 'server-only';
import Papa from 'papaparse';

const BASE_URL =
  process.env.OMEN_SHEET_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1Wc95lbFEv9Z9M8_rETut4dto-D7ff8N-eJAMJw6xdjk/export?format=csv';

const spreadsheetId = BASE_URL.match(/spreadsheets\/d\/([^/&?]+)/)?.[1] ?? '';

// /gviz/tq?tqx=out:csv&sheet=Multiplayer targets the "Multiplayer" named tab
export const MULTI_URL =
  process.env.MULTI_SHEET_CSV_URL ||
  `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Multiplayer`;

export type PoolRow = {
  deezerTrackUrl: string;
  answerYear: number;
  scheduledDate?: string; // YYYY-MM-DD if this row is pinned as a daily song
};

export type ScheduledPoolRow = {
  trackId: string;
  deezerTrackUrl: string;
  answerYear: number;
  scheduledDate: string;
  entryNumber?: number;
};

export async function fetchMultiPool(): Promise<PoolRow[]> {
  const res = await fetch(MULTI_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`MULTI sheet fetch failed: ${res.status}`);
  const text = await res.text();

  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const rows: PoolRow[] = [];
  for (const row of result.data) {
    // New format: track_id + year  (Multiplayer tab)
    // Old format: deezerTrackUrl + answerYear  (legacy MULTI tab)
    const trackId = (row['track_id'] ?? '').trim();
    const url = trackId
      ? `https://www.deezer.com/track/${trackId}`
      : (row['deezerTrackUrl'] ?? row['Deezer Track URL'] ?? '').trim();
    const yearRaw = (row['year'] ?? row['answerYear'] ?? row['Answer Year'] ?? '').trim();
    if (!url || !yearRaw) continue;
    const answerYear = parseInt(yearRaw, 10);
    if (isNaN(answerYear)) continue;
    const scheduledDate = (row['scheduled_date'] ?? '').trim() || undefined;
    rows.push({ deezerTrackUrl: url, answerYear, scheduledDate });
  }
  return rows;
}

// Returns only rows that have a scheduled_date set (used by /api/daily).
export async function fetchScheduledPool(): Promise<ScheduledPoolRow[]> {
  const res = await fetch(MULTI_URL, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`MULTI sheet fetch failed: ${res.status}`);
  const text = await res.text();

  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const rows: ScheduledPoolRow[] = [];
  for (const row of result.data) {
    const trackId = (row['track_id'] ?? '').trim();
    if (!trackId) continue;
    const scheduledDate = (row['scheduled_date'] ?? '').trim();
    if (!scheduledDate) continue;
    const yearRaw = (row['year'] ?? row['answerYear'] ?? '').trim();
    const answerYear = parseInt(yearRaw, 10);
    if (isNaN(answerYear)) continue;
    const entryRaw = (row['entry_number'] ?? '').trim();
    const entryNumber = entryRaw ? parseInt(entryRaw, 10) : undefined;
    rows.push({
      trackId,
      deezerTrackUrl: `https://www.deezer.com/track/${trackId}`,
      answerYear,
      scheduledDate,
      entryNumber: entryNumber && !isNaN(entryNumber) ? entryNumber : undefined,
    });
  }
  return rows;
}

export function selectScheduledRow(rows: ScheduledPoolRow[], dayKey: string): ScheduledPoolRow | null {
  return rows.find(r => r.scheduledDate === dayKey) ?? null;
}

// Fisher-Yates sample of n rows from the pool
export function samplePool(pool: PoolRow[], n: number): PoolRow[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(n, arr.length));
}
