import 'server-only';
import Papa from 'papaparse';
import type { OmenContentRow } from './omenTypes';

const SHEET_CSV_URL =
  process.env.OMEN_SHEET_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1Wc95lbFEv9Z9M8_rETut4dto-D7ff8N-eJAMJw6xdjk/export?format=csv';

function normalizeDate(raw: string): string {
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // DD/MM/YYYY (Google Sheets French/European locale)
  const dmy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  // MM/DD/YYYY (US locale)
  const mdy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) return `${mdy[3]}-${mdy[1].padStart(2, '0')}-${mdy[2].padStart(2, '0')}`;
  return raw;
}

export async function fetchOmenSheet(): Promise<OmenContentRow[]> {
  const res = await fetch(SHEET_CSV_URL, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status}`);
  const text = await res.text();

  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const rows: OmenContentRow[] = [];
  for (const row of result.data) {
    const rawDate = row.date?.trim();
    const deezerTrackUrl = row.deezerTrackUrl?.trim();
    const answerYearRaw = row.answerYear?.trim();
    if (!rawDate || !deezerTrackUrl || !answerYearRaw) continue;
    const answerYear = parseInt(answerYearRaw, 10);
    if (isNaN(answerYear)) continue;
    const date = normalizeDate(rawDate);
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
