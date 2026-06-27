import { NextResponse } from 'next/server';
import { getRoom, getAllPlayers } from '@/lib/roomStorage';

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

  // Current round entry: audio URL only, no album info or answerYear
  const currentEntry = room.status === 'active' && room.currentRound < room.roundEntries.length
    ? {
        roundIndex: room.currentRound,
        audioUrl: room.roundEntries[room.currentRound].audioUrl,
      }
    : null;

  // Completed rounds: full album info revealed
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
