import type { OmenDistanceBand, OmenDirection } from './omenTypes';

export type RoomStatus = 'lobby' | 'active' | 'finished';

// Stored server-side in KV — answerYear never sent to client during active rounds
export type RoundEntry = {
  roundIndex: number;
  trackId: string;
  deezerTrackUrl: string;
  answerYear: number;
  audioUrl: string;
  albumTitle: string;
  artist: string;
  coverImageUrl: string;
  deezerAlbumUrl: string;
  trackTitle?: string;
};

export type RoundGuess = {
  roundIndex: number;
  year: number;
  correct: boolean;
  band: OmenDistanceBand | null;
  direction: OmenDirection | null;
  score: number;
  submittedAt: string;
};

export type Player = {
  token: string;
  nickname: string;
  joinedAt: string;
  guesses: RoundGuess[];
};

export type Room = {
  id: string;
  status: RoomStatus;
  rounds: number;
  hostToken: string;
  roundEntries: RoundEntry[];
  currentRound: number;
  createdAt: string;
  expiresAt: string;
};

// Leaderboard row returned to client
export type PlayerScore = {
  nickname: string;
  totalScore: number;
  roundScores: Array<{
    roundIndex: number;
    baseScore: number;
    bonus: number;
    year: number;
    correct: boolean;
    band: OmenDistanceBand | null;
    direction: OmenDirection | null;
  }>;
};
