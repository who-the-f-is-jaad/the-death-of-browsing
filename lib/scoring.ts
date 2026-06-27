// Proximity score: exact = 1000, −25 per year off, floor 0
// Max with round-winner bonus: 1200 (1000 base + 200 bonus)
export function computeProximityScore(guess: number, answer: number): number {
  const diff = Math.abs(guess - answer);
  return Math.max(0, 1000 - diff * 25);
}

// Round-winner bonus: +200 for the player(s) with the smallest distance this round.
// Returns a map of playerToken → bonus amount.
export function computeRoundBonuses(
  guesses: Array<{ token: string; year: number }>,
  answerYear: number,
): Record<string, number> {
  if (guesses.length === 0) return {};
  const diffs = guesses.map(g => ({ token: g.token, diff: Math.abs(g.year - answerYear) }));
  const minDiff = Math.min(...diffs.map(d => d.diff));
  return Object.fromEntries(diffs.map(d => [d.token, d.diff === minDiff ? 200 : 0]));
}
