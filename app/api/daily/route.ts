import { fetchOmenSheet, selectOmenRow } from '@/lib/omenSheet';
import { enrichFromDeezer } from '@/lib/omenDeezer';
import { getCurrentDayKey } from '@/lib/resetTime';

export async function GET() {
  const key = getCurrentDayKey();

  const rows = await fetchOmenSheet();
  const row = selectOmenRow(rows, key);
  if (!row) {
    return Response.json({ entry: null, reason: 'no_entry' });
  }

  const entry = await enrichFromDeezer(row.deezerTrackUrl, row.answerYear, key);
  if (!entry) {
    return Response.json({ entry: null, reason: 'no_entry' });
  }

  if (!entry.audioOmen.audioUrl) {
    return Response.json({ entry, reason: 'no_preview' });
  }

  return Response.json({ entry });
}
