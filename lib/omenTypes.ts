export type OmenContentRow = {
  date: string;
  deezerTrackUrl: string;
  answerYear: number;
};

export type OmenDistanceBand = 'NEAR' | 'FADING' | 'BURIED' | 'LOST';
export type OmenDirection = 'UNBORN' | 'TOO_LATE';

export type AudioOmenEntry = {
  id: string;         // `${date}:${trackId}:${answerYear}`
  dateUtc: string;
  entryNumber?: number;
  audioOmen: {
    audioUrl: string;
    audioSource: 'deezer_preview';
    answerYear: number;
    maxAttempts: 3;
  };
  track?: {
    title?: string;
    deezerUrl?: string;
  };
  album: {
    title: string;
    artist: string;
    year?: number;
    coverImageUrl?: string;
    deezerUrl: string;
    editorialNote?: string;
  };
};

export type OmenGuess = {
  year: number;
  band?: OmenDistanceBand;
  direction?: OmenDirection;
  correct: boolean;
  attemptedAt: string;
};

export type OmenLocalState = {
  entryId: string;
  opened: boolean;       // sealed CTA was clicked
  solved: boolean;
  solvedAt?: string;
  attemptsSpent: number;
  guesses: OmenGuess[];
  lockedUntil?: string;  // ISO string
  currentAttemptHeard: boolean; // mark spent, awaiting guess
};

export type CurrentAttemptStatus = {
  hasSpentMark: boolean;
  canGuess: boolean;
  audioStatus: 'idle' | 'loading' | 'playing' | 'ended' | 'error';
};
