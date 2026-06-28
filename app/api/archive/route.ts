import { fetchOmenSheet } from '@/lib/omenSheet';
import { fetchScheduledPool } from '@/lib/songPool';
import { enrichFromDeezer } from '@/lib/omenDeezer';
import { getCurrentDayKey } from '@/lib/resetTime';

export interface ArchiveItem {
  date: string;
  year: number;
  albumTitle: string | null;
  artist: string | null;
}

export async function GET() {
  const today = getCurrentDayKey();

  const [sheetResult, scheduledResult] = await Promise.allSettled([
    fetchOmenSheet(),
    fetchScheduledPool(),
  ]);

  const sheetRows = sheetResult.status === 'fulfilled' ? sheetResult.value : [];
  const schedRows = scheduledResult.status === 'fulfilled'
    ? scheduledResult.value.filter(r => r.scheduledDate < today)
    : [];

  // Build merged list: deduplicate by date (sheet rows take priority)
  const datesSeen = new Set(sheetRows.filter(r => r.date < today).map(r => r.date));

  const allRows: Array<{ date: string; deezerTrackUrl: string; answerYear: number }> = [
    ...sheetRows.filter(r => r.date < today),
    ...schedRows
      .filter(r => !datesSeen.has(r.scheduledDate))
      .map(r => ({ date: r.scheduledDate, deezerTrackUrl: r.deezerTrackUrl, answerYear: r.answerYear })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const items: ArchiveItem[] = await Promise.all(
    allRows.map(async (row): Promise<ArchiveItem> => {
      try {
        const entry = await enrichFromDeezer(row.deezerTrackUrl, row.answerYear, row.date);
        return {
          date: row.date,
          year: row.answerYear,
          albumTitle: entry?.album.title ?? null,
          artist: entry?.album.artist ?? null,
        };
      } catch {
        return { date: row.date, year: row.answerYear, albumTitle: null, artist: null };
      }
    })
  );

  return Response.json({ items }, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  });
}
