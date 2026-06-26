/**
 * Normalizes a raw answer string for comparison against accepted answers.
 *
 * Steps applied in order:
 *   1. Trim + lowercase
 *   2. Decompose diacritics, strip combining marks (U+0300-U+036F)
 *   3. Strip all punctuation (keep alphanumeric + spaces)
 *   4. Collapse whitespace runs to single space
 *   5. Strip leading articles: "the", "a", "an"
 */
export function normalizeAnswer(raw: string): string {
  let s = raw.trim().toLowerCase();
  // NFD decompose, then remove combining diacritical marks
  s = s.normalize('NFD');
  s = s.replace(new RegExp('[\\u0300-\\u036f]', 'g'), '');
  s = s.replace(/[^a-z0-9\s]/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/^(the|a|an)\s+/, '');
  return s;
}

/**
 * Returns true if the normalized raw input matches any accepted answer.
 * Both sides are normalized before comparison.
 */
export function checkAnswer(raw: string, acceptedAnswers: string[]): boolean {
  const input = normalizeAnswer(raw);
  if (!input) return false;
  return acceptedAnswers.some((ans) => normalizeAnswer(ans) === input);
}
