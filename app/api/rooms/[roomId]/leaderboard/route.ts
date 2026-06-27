import { NextResponse } from 'next/server';
import { getRoom, getAllPlayers } from '@/lib/roomStorage';
import { computeRoundBonuses } from '@/lib/scoring';
import type { PlayerScore } from '@/lib/roomTypes';

function getToken(req: Request): string | null {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  const myToken = getToken(req);

  const room = await getRoom(roomId);
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

  const players = await getAllPlayers(roomId);
  const completedRounds = room.status === 'finished' ? room.rounds : room.currentRound;

  // Compute round bonuses for each completed round
  const bonusesByRound: Array<Record<string, number>> = [];
  for (let ri = 0; ri < completedRounds; ri++) {
    const guessesForRound = players
      .map(p => ({ token: p.token, guess: p.guesses.find(g => g.roundIndex === ri) }))
      .filter(x => x.guess !== undefined)
      .map(x => ({ token: x.token, year: x.guess!.year }));
    bonusesByRound[ri] = computeRoundBonuses(guessesForRound, room.roundEntries[ri].answerYear);
  }

  const scores: PlayerScore[] = players.map(p => {
    const roundScores = [];
    let totalScore = 0;

    for (let ri = 0; ri < completedRounds; ri++) {
      const guess = p.guesses.find(g => g.roundIndex === ri);
      const baseScore = guess?.score ?? 0;
      const bonus = (bonusesByRound[ri] ?? {})[p.token] ?? 0;
      totalScore += baseScore + bonus;
      roundScores.push({
        roundIndex: ri,
        baseScore,
        bonus,
        year: guess?.year ?? 0,
        correct: guess?.correct ?? false,
        band: guess?.band ?? null,
        direction: guess?.direction ?? null,
      });
    }

    return { nickname: p.nickname, totalScore, roundScores, isYou: p.token === myToken };
  });

  scores.sort((a, b) => b.totalScore - a.totalScore);

  return NextResponse.json({ players: scores, completedRounds, totalRounds: room.rounds });
}
