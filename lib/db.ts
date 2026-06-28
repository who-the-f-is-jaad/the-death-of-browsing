import { kv } from '@vercel/kv';
import { updateStreakOnSolve } from './streaks';
import type { StreakData } from './types';

export interface DayCell {
  date: string;
  played: boolean;
  solved: boolean;
}

export interface PublicStats {
  streak: StreakData;
  totalPlayed: number;
  totalSolved: number;
  winRate: number; // 0-100
  grid: DayCell[]; // last 30 days, oldest first
}

export interface GameResult {
  date: string;
  solved: boolean;
  attempts: number;
}

const DEFAULT_STREAK: StreakData = { current: 0, longest: 0, lastSolvedDate: null };

export async function getUserStreak(userId: string): Promise<StreakData> {
  const streak = await kv.get<StreakData>(`tdb:streak:${userId}`);
  return streak ?? DEFAULT_STREAK;
}

export async function getUserHistory(userId: string, limit = 30): Promise<GameResult[]> {
  const dates = await kv.lrange<string>(`tdb:history:${userId}`, 0, limit - 1);
  if (!dates || dates.length === 0) return [];
  const results = await Promise.all(
    dates.map(date => kv.get<GameResult>(`tdb:result:${userId}:${date}`))
  );
  return results.filter((r): r is GameResult => r !== null);
}

export async function getUserPublicStats(userId: string, days = 30): Promise<PublicStats> {
  const [streak, history] = await Promise.all([
    getUserStreak(userId),
    getUserHistory(userId, 90),
  ]);

  const totalPlayed = history.length;
  const totalSolved = history.filter(r => r.solved).length;
  const winRate = totalPlayed > 0 ? Math.round((totalSolved / totalPlayed) * 100) : 0;

  const historyMap = new Map(history.map(r => [r.date, r]));
  const grid: DayCell[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const date = d.toISOString().slice(0, 10);
    const result = historyMap.get(date);
    grid.push({ date, played: !!result, solved: result?.solved ?? false });
  }

  return { streak, totalPlayed, totalSolved, winRate, grid };
}

export async function recordResult(
  userId: string,
  date: string,
  solved: boolean,
  attempts: number,
): Promise<void> {
  const resultKey = `tdb:result:${userId}:${date}`;
  const existing = await kv.get(resultKey);
  if (existing) return; // idempotent — don't double-record

  await kv.set(resultKey, { date, solved, attempts } satisfies GameResult);
  await kv.lpush(`tdb:history:${userId}`, date);
  await kv.ltrim(`tdb:history:${userId}`, 0, 89);

  if (solved) {
    const current = await getUserStreak(userId);
    const updated = updateStreakOnSolve(current, date);
    await kv.set(`tdb:streak:${userId}`, updated);
  }
}
