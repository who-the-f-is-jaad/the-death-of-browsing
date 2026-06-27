import 'server-only';
import Papa from 'papaparse';

const BASE_URL =
  process.env.OMEN_SHEET_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1Wc95lbFEv9Z9M8_rETut4dto-D7ff8N-eJAMJw6xdjk/export?format=csv';

const spreadsheetId = BASE_URL.match(/spreadsheets\/d\/([^/&?]+)/)?.[1] ?? '';

// /gviz/tq?tqx=out:csv&sheet=MULTI works for named tabs on public sheets
const MULTI_URL =
  process.env.MULTI_SHEET_CSV_URL ||
  `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=MULTI`;

export type PoolRow = {
  deezerTrackUrl: string;
  answerYear: number;
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
    // Tolerate minor column name variations
    const url = (row['deezerTrackUrl'] ?? row['Deezer Track URL'] ?? '').trim();
    const yearRaw = (row['answerYear'] ?? row['Answer Year'] ?? row['year'] ?? '').trim();
    if (!url || !yearRaw) continue;
    const answerYear = parseInt(yearRaw, 10);
    if (isNaN(answerYear)) continue;
    rows.push({ deezerTrackUrl: url, answerYear });
  }
  return rows;
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
