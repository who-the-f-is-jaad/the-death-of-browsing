// Prototype only:
// This public Google Sheet and client-side Deezer enrichment expose answer years
// and future entries to users who inspect network requests. Production must move
// content fetching and validation server-side before public launch.

import Papa from 'papaparse';
import type { OmenContentRow } from './omenTypes';

const SHEET_CSV_URL =
  process.env.NEXT_PUBLIC_OMEN_SHEET_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1Wc95lbFEv9Z9M8_rETut4dto-D7ff8N-eJAMJw6xdjk/export?format=csv';

export async function fetchOmenSheet(): Promise<OmenContentRow[]> {
  const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const text = await res.text();

  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const rows: OmenContentRow[] = [];
  for (const row of result.data) {
    const date = row.date?.trim();
    const deezerTrackUrl = row.deezerTrackUrl?.trim();
    const answerYearRaw = row.answerYear?.trim();
    if (!date || !deezerTrackUrl || !answerYearRaw) continue;
    const answerYear = parseInt(answerYearRaw, 10);
    if (isNaN(answerYear)) continue;
    rows.push({ date, deezerTrackUrl, answerYear });
  }
  return rows;
}

export function selectOmenRow(rows: OmenContentRow[], deadWaxDate: string): OmenContentRow | null {
  // Exact match
  const exact = rows.find(r => r.date === deadWaxDate);
  if (exact) return exact;

  // Latest valid row before the dead wax date
  const before = rows
    .filter(r => r.date < deadWaxDate)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (before.length > 0) return before[0];

  // First valid row as fallback
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  return sorted[0] ?? null;
}
