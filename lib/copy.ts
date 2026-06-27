// Brand copy dictionary for THE DEATH OF BROWSING.
// All user-visible strings live here. Never hardcode copy in components.

export const COPY = {
  // ── Identity ──────────────────────────────────────────────────────────────
  appName: 'THE DEATH OF BROWSING',
  tagline: 'One sound. One year. Every dawn.',
  resetMeridian: 'Midnight on the Dead Wax Meridian',

  // ── Sealed state ──────────────────────────────────────────────────────────
  sealedHeadline: 'One record remains.',
  sealedBody: 'The feed is dead. One riddle stands between you and the music.',
  sealedCTA: 'Answer the Omen',

  // ── Riddle state ──────────────────────────────────────────────────────────
  riddleLabel: 'The Omen',
  riddleInputLabel: 'Your answer',
  riddleInputPlaceholder: 'Type your answer...',
  riddleSubmitLabel: 'Submit',
  riddleHintReveal: 'A clue, at cost.',
  attemptsRemaining: (n: number) =>
    n === 1 ? '1 attempt remains.' : `${n} attempts remain.`,

  // ── Wrong answer messages (Darkest Dungeon tone, no insults) ─────────────
  // Used in order: first wrong, second wrong, third wrong (triggers lock)
  riddleErrors: [
    'The omen holds. The seal does not break.',
    'Close, perhaps. But the wax keeps its secret.',
    'Three false omens. The record retreats into silence.',
  ],

  // ── Soft lock ─────────────────────────────────────────────────────────────
  softLockTitle: 'The rite is broken.',
  softLockBody:
    'Three false answers. The record will not yield until the silence passes.',
  softLockCountdownLabel: 'The needle may drop again in:',
  softLockExpiredLabel: 'The silence has passed.',
  softLockRetryLabel: 'Begin again.',

  // ── Unlock ────────────────────────────────────────────────────────────────
  unlockingLine: 'The seal breaks.',

  // ── Album reveal ──────────────────────────────────────────────────────────
  revealTagline: 'The scroll ends here.',
  listenOnDeezer: 'Listen on Deezer',
  listenOnSpotify: 'Spotify',
  listenOnAppleMusic: 'Apple Music',
  listenOnYouTubeMusic: 'YouTube Music',
  watchOnYouTube: 'Watch on YouTube',
  nextRecordLabel: 'Next record at',
  nextResetMeridian: '07:00 UTC',

  // ── Share ─────────────────────────────────────────────────────────────────
  shareLabel: 'Share your rite',
  shareCopied: 'Copied.',

  // ── Streak ────────────────────────────────────────────────────────────────
  streakUnit: (n: number) => (n === 1 ? '1 day' : `${n} days`),
  streakLabel: 'without the feed',
  streakBrokenLabel: 'The streak is broken. Return at dawn.',

  // ── Navigation ────────────────────────────────────────────────────────────
  navArchive: 'Archive',
  navAbout: 'About',

  // ── Archive ───────────────────────────────────────────────────────────────
  archiveTitle: 'The Archive',
  archiveSubtext: 'Records that have been heard.',
  archiveEmpty: 'No records yet. The archive is sealed.',

  // ── About ─────────────────────────────────────────────────────────────────
  aboutTitle: 'What remains.',
  aboutLines: [
    'THE DEATH OF BROWSING is a daily music discovery ritual.',
    'No feed. No scroll. No algorithm.',
    'Every day, one globally shared album is sealed behind a riddle.',
    'Solve the riddle. Hear the record.',
    'The rite resets at midnight on the Dead Wax Meridian.',
    'Missing a day breaks your streak. Return at dawn.',
    'The feed is dead. One record remains.',
  ],

  // ── Invite ────────────────────────────────────────────────────────────────
  inviteTitle: 'The invitation.',
  inviteSubtext:
    'During the beta, an invite code is required to create an account and save your streak.',
  inviteInputLabel: 'Invite code',
  inviteSubmitLabel: 'Claim your place',
  inviteInvalid: 'This code is not recognized.',
  inviteSuccess: 'The door is open.',

  // ── Generic ───────────────────────────────────────────────────────────────
  loading: 'Summoning the Omen',
  noEntryToday: 'No record today.',
  noEntrySubtext: 'Return at dawn.',
  genericError: 'Something broke the rite. Refresh to continue.',
} as const;
