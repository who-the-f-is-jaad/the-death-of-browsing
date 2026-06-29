import { kv } from '@vercel/kv';
import { updateStreakOnSolve } from './streaks';
import { fetchScheduledPool } from './songPool';
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
  decadeStats: DecadeStat[];
}

export interface GameResult {
  date: string;
  solved: boolean;
  attempts: number;
  answerYear?: number;
}

export interface DecadeStat {
  decade: number;  // e.g. 1980 means "the 80s"
  played: number;
  solved: number;
}

export interface SoloBest {
  score: number;
  date: string;
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

  // Decade accuracy — for records missing answerYear, fall back to the scheduled pool
  const missingYearDates = history.filter(r => !r.answerYear);
  const dateToYear = new Map<string, number>();
  if (missingYearDates.length > 0) {
    try {
      const scheduled = await fetchScheduledPool();
      for (const row of scheduled) dateToYear.set(row.scheduledDate, row.answerYear);
    } catch {}
  }

  const byDecade = new Map<number, { played: number; solved: number }>();
  for (const r of history) {
    const year = r.answerYear ?? dateToYear.get(r.date);
    if (!year) continue;
    const decade = Math.floor(year / 10) * 10;
    const prev = byDecade.get(decade) ?? { played: 0, solved: 0 };
    byDecade.set(decade, { played: prev.played + 1, solved: prev.solved + (r.solved ? 1 : 0) });
  }
  const decadeStats: DecadeStat[] = Array.from(byDecade.entries())
    .map(([decade, s]) => ({ decade, played: s.played, solved: s.solved }))
    .sort((a, b) => a.decade - b.decade);

  return { streak, totalPlayed, totalSolved, winRate, grid, decadeStats };
}

export async function recordResult(
  userId: string,
  date: string,
  solved: boolean,
  attempts: number,
  answerYear?: number,
): Promise<void> {
  const resultKey = `tdb:result:${userId}:${date}`;
  const existing = await kv.get<GameResult>(resultKey);
  if (existing) {
    if (answerYear !== undefined && !existing.answerYear) {
      await kv.set(resultKey, { ...existing, answerYear });
    }
    return;
  }

  const result: GameResult = { date, solved, attempts };
  if (answerYear !== undefined) result.answerYear = answerYear;
  await kv.set(resultKey, result);
  await kv.lpush(`tdb:history:${userId}`, date);
  await kv.ltrim(`tdb:history:${userId}`, 0, 89);

  if (solved) {
    const current = await getUserStreak(userId);
    const updated = updateStreakOnSolve(current, date);
    await kv.set(`tdb:streak:${userId}`, updated);
  }
}

export async function addPoints(userId: string, points: number): Promise<void> {
  if (points <= 0) return;
  await kv.incrby(`tdb:points:${userId}`, Math.round(points));
}

export async function getUserCoins(userId: string): Promise<number> {
  const points = (await kv.get<number>(`tdb:points:${userId}`)) ?? 0;
  return Math.floor(points / 10000);
}

export async function getUnlockedPortraits(userId: string): Promise<string[]> {
  return (await kv.get<string[]>(`tdb:portrait-unlocks:${userId}`)) ?? [];
}

export async function unlockPortrait(
  userId: string,
  portrait: string,
  price: number,
): Promise<'ok' | 'insufficient_coins' | 'already_unlocked'> {
  const [unlocked, rawPoints] = await Promise.all([
    getUnlockedPortraits(userId),
    kv.get<number>(`tdb:points:${userId}`),
  ]);

  if (unlocked.includes(portrait)) return 'already_unlocked';

  const coins = Math.floor((rawPoints ?? 0) / 10000);
  if (coins < price) return 'insufficient_coins';

  const cost = price * 10000;
  await Promise.all([
    kv.incrby(`tdb:points:${userId}`, -cost),
    kv.set(`tdb:portrait-unlocks:${userId}`, [...unlocked, portrait]),
  ]);

  return 'ok';
}

export async function getBestSoloScore(userId: string): Promise<SoloBest | null> {
  return kv.get<SoloBest>(`tdb:solo-best:${userId}`);
}

export async function saveSoloScore(userId: string, score: number): Promise<void> {
  const key = `tdb:solo-best:${userId}`;
  const current = await kv.get<SoloBest>(key);
  if (!current || score > current.score) {
    await kv.set(key, { score, date: new Date().toISOString().slice(0, 10) } satisfies SoloBest);
  }
}
