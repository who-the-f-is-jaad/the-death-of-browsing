import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { getRoom, getAllPlayers } from '@/lib/roomStorage';
import { computeRoundBonuses } from '@/lib/scoring';
import { getSession } from '@/lib/auth';
import { addPoints } from '@/lib/db';
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

    return { nickname: p.nickname, portrait: p.portrait ?? null, totalScore, roundScores, isYou: p.token === myToken };
  });

  scores.sort((a, b) => b.totalScore - a.totalScore);

  // Award points once per player when game is finished
  if (room.status === 'finished' && myToken) {
    const awardKey = `tdb:pts-awarded:${roomId}:${myToken}`;
    const alreadyAwarded = await kv.get(awardKey);
    if (!alreadyAwarded) {
      const myPlayer = players.find(p => p.token === myToken);
      const myTotalScore = myPlayer
        ? scores.find(s => s.nickname === myPlayer.nickname)?.totalScore ?? 0
        : 0;
      const session = await getSession();
      if (myTotalScore > 0 && session) {
        await Promise.all([
          addPoints(session.userId, myTotalScore),
          kv.set(awardKey, 1, { ex: 60 * 60 * 24 * 7 }),
        ]);
      }
    }
  }

  return NextResponse.json({ players: scores, completedRounds, totalRounds: room.rounds });
}
