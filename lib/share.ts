import type { Attempt } from './types';

const MAX_ICONS = 10;

/**
 * Generates the share text for a completed (or failed) daily entry.
 * Does not reveal the album name or the answer.
 */
export function generateShareText(
  entryNumber: number,
  attempts: Attempt[],
  solved: boolean,
  url: string,
): string {
  const icons = attempts
    .slice(0, MAX_ICONS)
    .map((a) => (a.correct ? '✅' : '❌'))
    .join(' ');

  const count = attempts.length;
  const resultLine = solved
    ? `I broke the scroll in ${count} tr${count === 1 ? 'y' : 'ies'}.`
    : 'The seal held.';

  return [
    `THE DEATH OF BROWSING #${String(entryNumber).padStart(3, '0')}`,
    `🕯️ ${icons}`,
    resultLine,
    'One record remains.',
    url,
  ].join('\n');
}

/** Copies text to clipboard; returns true on success. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}
