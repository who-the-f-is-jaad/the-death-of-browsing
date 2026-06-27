import { NextResponse } from 'next/server';
import { enrichFromDeezer } from '@/lib/omenDeezer';
import { fetchMultiPool, samplePool } from '@/lib/songPool';
import { generateRoomId, generateToken, addPlayerToRoom, setRoom } from '@/lib/roomStorage';
import type { Room, Player, RoundEntry } from '@/lib/roomTypes';

export async function POST(req: Request) {
  try {
    const { rounds, nickname } = await req.json() as { rounds: number; nickname: string };

    if (![3, 5, 10].includes(rounds)) {
      return NextResponse.json({ error: 'rounds must be 3, 5, or 10' }, { status: 400 });
    }
    const nick = nickname?.trim();
    if (!nick || nick.length < 1 || nick.length > 24) {
      return NextResponse.json({ error: 'nickname must be 1–24 characters' }, { status: 400 });
    }

    let pool;
    try {
      pool = await fetchMultiPool();
    } catch (e) {
      console.error('[POST /api/rooms] fetchMultiPool failed:', e);
      return NextResponse.json({ error: `Sheet fetch failed: ${e instanceof Error ? e.message : e}` }, { status: 502 });
    }

    if (pool.length < rounds) {
      return NextResponse.json({ error: `Not enough songs in pool (got ${pool.length}, need ${rounds})` }, { status: 500 });
    }

    const sampled = samplePool(pool, rounds);
    const roomId = generateRoomId();

    // Enrich all rounds sequentially to avoid hammering Deezer rate limits
    const enriched: (Awaited<ReturnType<typeof enrichFromDeezer>>)[] = [];
    for (const row of sampled) {
      enriched.push(await enrichFromDeezer(row.deezerTrackUrl, row.answerYear, `dm-${roomId}-${enriched.length}`));
    }

    const roundEntries: RoundEntry[] = [];
    for (let i = 0; i < enriched.length; i++) {
      const entry = enriched[i];
      if (!entry) {
        console.warn(`[POST /api/rooms] enrichment returned null for ${sampled[i]?.deezerTrackUrl}`);
        continue;
      }
      const raw = sampled[i];
      const trackId = entry.id.split(':').pop() ?? '';
      roundEntries.push({
        roundIndex: roundEntries.length,
        trackId,
        deezerTrackUrl: raw.deezerTrackUrl,
        answerYear: raw.answerYear,
        albumTitle: entry.album.title,
        artist: entry.album.artist,
        coverImageUrl: entry.album.coverImageUrl ?? '',
        deezerAlbumUrl: entry.album.deezerUrl,
        trackTitle: entry.track?.title,
      });
    }

    if (roundEntries.length < rounds) {
      return NextResponse.json({ error: `Only ${roundEntries.length}/${rounds} tracks could be enriched from Deezer` }, { status: 500 });
    }

    const hostToken = generateToken();
    const playerToken = generateToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const room: Room = {
      id: roomId,
      status: 'lobby',
      rounds,
      hostToken,
      roundEntries,
      currentRound: 0,
      createdAt: now.toISOString(),
      expiresAt,
    };

    const player: Player = {
      token: playerToken,
      nickname: nick,
      joinedAt: now.toISOString(),
      guesses: [],
    };

    try {
      await setRoom(room);
    } catch (e) {
      console.error('[POST /api/rooms] setRoom failed:', e);
      return NextResponse.json({ error: `KV write failed (room): ${e instanceof Error ? e.message : e}` }, { status: 503 });
    }

    try {
      await addPlayerToRoom(roomId, player);
    } catch (e) {
      console.error('[POST /api/rooms] addPlayerToRoom failed:', e);
      return NextResponse.json({ error: `KV write failed (player): ${e instanceof Error ? e.message : e}` }, { status: 503 });
    }

    return NextResponse.json({ roomId, playerToken, hostToken });
  } catch (err) {
    console.error('[POST /api/rooms]', err);
    return NextResponse.json({ error: `Internal error: ${err instanceof Error ? err.message : err}` }, { status: 500 });
  }
}
