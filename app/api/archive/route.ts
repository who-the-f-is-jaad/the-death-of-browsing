import { fetchOmenSheet } from '@/lib/omenSheet';
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
  const rows = await fetchOmenSheet();

  const past = rows
    .filter(r => r.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const items: ArchiveItem[] = await Promise.all(
    past.map(async (row): Promise<ArchiveItem> => {
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
