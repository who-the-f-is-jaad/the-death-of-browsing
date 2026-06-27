import { fetchOmenSheet, selectOmenRow } from '@/lib/omenSheet';
import { enrichFromDeezer } from '@/lib/omenDeezer';
import { getCurrentDayKey, getPreviousDayKey } from '@/lib/resetTime';

export async function GET() {
  const key = getPreviousDayKey(getCurrentDayKey());

  const rows = await fetchOmenSheet();
  const row = selectOmenRow(rows, key);
  if (!row) {
    return Response.json({ entry: null });
  }

  const entry = await enrichFromDeezer(row.deezerTrackUrl, row.answerYear, key);
  return Response.json({ entry: entry ?? null });
}
