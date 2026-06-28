import { NextResponse } from 'next/server';
import { getRoom, getAllPlayers, getCachedPreview, setCachedPreview } from '@/lib/roomStorage';
import { fetchDeezerPreview } from '@/lib/omenDeezer';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  const room = await getRoom(roomId);
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

  const players = await getAllPlayers(roomId);

  // Build player list showing only nicknames + whether they've guessed this round
  const playerList = players.map(p => ({
    nickname: p.nickname,
    hasGuessedCurrentRound: p.guesses.some(g => g.roundIndex === room.currentRound),
  }));

  // Current round entry: fetch preview URL fresh (KV-cached 55 min), no album info or answerYear
  let currentEntry: { roundIndex: number; audioUrl: string } | null = null;
  if (room.status === 'active' && room.currentRound < room.roundEntries.length) {
    const { trackId } = room.roundEntries[room.currentRound];
    let audioUrl = (await getCachedPreview(trackId)) ?? '';
    if (!audioUrl) {
      audioUrl = await fetchDeezerPreview(trackId);
      if (audioUrl) await setCachedPreview(trackId, audioUrl);
    }
    currentEntry = { roundIndex: room.currentRound, audioUrl };
  }

  // Completed rounds: full album info + per-player guesses revealed
  const revealedEntries = room.roundEntries
    .filter(e => e.roundIndex < room.currentRound || room.status === 'finished')
    .map(e => ({
      roundIndex: e.roundIndex,
      answerYear: e.answerYear,
      albumTitle: e.albumTitle,
      artist: e.artist,
      coverImageUrl: e.coverImageUrl,
      deezerAlbumUrl: e.deezerAlbumUrl,
      trackTitle: e.trackTitle,
      playerGuesses: players
        .map(p => {
          const g = p.guesses.find(g => g.roundIndex === e.roundIndex);
          return g ? { nickname: p.nickname, year: g.year, score: g.score, correct: g.correct } : null;
        })
        .filter((g): g is { nickname: string; year: number; score: number; correct: boolean } => g !== null)
        .sort((a, b) => b.score - a.score),
    }));

  return NextResponse.json({
    id: room.id,
    status: room.status,
    rounds: room.rounds,
    currentRound: room.currentRound,
    currentEntry,
    revealedEntries,
    players: playerList,
    expiresAt: room.expiresAt,
  });
}
