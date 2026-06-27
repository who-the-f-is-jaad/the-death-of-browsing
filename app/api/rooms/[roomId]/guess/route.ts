import { NextResponse } from 'next/server';
import { getRoom, setRoom, getAllPlayers, addGuessToPlayer } from '@/lib/roomStorage';
import { computeProximityScore } from '@/lib/scoring';
import { getOmenFeedback } from '@/lib/omenFeedback';
import type { RoundGuess } from '@/lib/roomTypes';

function getToken(req: Request): string | null {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  const playerToken = getToken(req);
  if (!playerToken) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const { year, roundIndex } = await req.json() as { year: number; roundIndex: number };
  if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear()) {
    return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
  }

  const room = await getRoom(roomId);
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  if (room.status !== 'active') {
    return NextResponse.json({ error: 'Room is not active' }, { status: 409 });
  }
  if (roundIndex !== room.currentRound) {
    return NextResponse.json({ error: 'Wrong round' }, { status: 409 });
  }

  const roundEntry = room.roundEntries[roundIndex];
  if (!roundEntry) return NextResponse.json({ error: 'Round not found' }, { status: 404 });

  const allPlayers = await getAllPlayers(roomId);
  const player = allPlayers.find(p => p.token === playerToken);
  if (!player) return NextResponse.json({ error: 'Not in this room' }, { status: 403 });

  // Idempotency: already guessed this round
  if (player.guesses.some(g => g.roundIndex === roundIndex)) {
    return NextResponse.json({ error: 'Already submitted for this round' }, { status: 409 });
  }

  const { correct, band, direction } = getOmenFeedback(year, roundEntry.answerYear);
  const score = computeProximityScore(year, roundEntry.answerYear);

  const guess: RoundGuess = {
    roundIndex,
    year,
    correct,
    band: band ?? null,
    direction: direction ?? null,
    score,
    submittedAt: new Date().toISOString(),
  };

  await addGuessToPlayer(roomId, playerToken, guess);

  // Re-fetch to get up-to-date guesses (may have changed since we fetched above)
  const freshPlayers = await getAllPlayers(roomId);
  const allGuessed = freshPlayers.every(p => p.guesses.some(g => g.roundIndex === roundIndex));

  let roundAdvanced = false;
  if (allGuessed) {
    // Re-fetch room to prevent double-advance race
    const freshRoom = await getRoom(roomId);
    if (freshRoom && freshRoom.currentRound === roundIndex) {
      freshRoom.currentRound++;
      if (freshRoom.currentRound >= freshRoom.rounds) {
        freshRoom.status = 'finished';
      }
      await setRoom(freshRoom);
      roundAdvanced = true;
    }
  }

  return NextResponse.json({ score, correct, band, direction, roundAdvanced });
}
