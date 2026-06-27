import type { OmenLocalState } from './omenTypes';

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[m - 1]} ${y}`;
}

/** Spoiler-free share text: shows guessed years + direction, never album/artist/correct year. */
export function generateShareText(omenState: OmenLocalState, date: string): string {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'thedeathofbrowsing.com';

  const scarsLines = omenState.guesses.map(g => {
    if (g.correct) return `✓ ${g.year}`;
    const dir = g.direction === 'UNBORN' ? 'too early' : 'too late';
    return `† ${g.year} — ${dir}`;
  }).join('\n');

  const failed = !omenState.solved;

  const parts: string[] = [
    `THE DEATH OF BROWSING — ${formatDate(date)}`,
    scarsLines,
    ...(failed ? ["Couldn't name this one. Help me out?"] : []),
    siteUrl,
  ];

  return parts.join('\n\n');
}

/** Share text variant for the soft-lock failure state (takes raw guesses, no full state needed). */
export function generateHelpShareText(guesses: OmenLocalState['guesses'], date: string): string {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'thedeathofbrowsing.com';

  const scarsLines = guesses.map(g => {
    const dir = g.direction === 'UNBORN' ? 'too early' : 'too late';
    return `† ${g.year} — ${dir}`;
  }).join('\n');

  return [
    `THE DEATH OF BROWSING — ${formatDate(date)}`,
    `3 tries. Nothing.\n${scarsLines}`,
    'Can you name it?',
    siteUrl,
  ].join('\n\n');
}

/** Try navigator.share, fall back to clipboard copy. */
export async function shareOrCopy(text: string): Promise<'shared' | 'copied' | 'failed'> {
  if (typeof navigator === 'undefined') return 'failed';

  if (navigator.share) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch {
      // User cancelled or unsupported — fall through
    }
  }

  return (await copyToClipboard(text)) ? 'copied' : 'failed';
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
