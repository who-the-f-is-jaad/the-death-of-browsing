// ── Daily experience states ──────────────────────────────────────────────────
export type DailyState =
  | 'sealed'       // Initial: entry is locked, CTA shown
  | 'riddle_active' // Riddle input is displayed, waiting for answer
  | 'riddle_error'  // A wrong answer was just submitted
  | 'soft_locked'   // 3 wrong answers; countdown until retry
  | 'unlocking'     // Correct answer: playing unlock animation
  | 'unlocked';     // Fully revealed; album, player, DSP links shown

// ── Daily entry (one per day, globally shared) ───────────────────────────────
export interface DailyEntry {
  entryNumber: number;
  date: string;         // YYYY-MM-DD (UTC day this entry is live)
  album: string;
  artist: string;
  year: number;
  genre: string;
  coverImageUrl: string;
  editorialNote: string;
  riddle: string;
  // PROTOTYPE-ONLY: accepted answers live on the client in this mock.
  // TODO: In production, move answer validation entirely to the server.
  //       The canonical answer set must never be sent to the client.
  acceptedAnswers: string[];
  hints: string[];
  youtubeEmbedUrl: string;
  deezerUrl: string;
  spotifyUrl: string;
  appleMusicUrl: string;
  youtubeMusicUrl: string;
}

// ── A single answer attempt ──────────────────────────────────────────────────
export interface Attempt {
  normalizedInput: string;
  correct: boolean;
  timestamp: number; // epoch ms
}

// ── Persisted per-day progress (stored in localStorage) ─────────────────────
export interface DailyProgress {
  entryDate: string;           // YYYY-MM-DD (matches DailyEntry.date)
  state: DailyState;
  attempts: Attempt[];
  attemptsInCurrentWindow: number; // resets after each soft lock expires
  softLockExpiresAt: number | null; // epoch ms, null when not locked
  solvedAt: number | null;         // epoch ms, null when not solved
}

// ── Streak data (stored in localStorage) ────────────────────────────────────
export interface StreakData {
  current: number;
  longest: number;
  lastSolvedDate: string | null; // YYYY-MM-DD UTC
}
