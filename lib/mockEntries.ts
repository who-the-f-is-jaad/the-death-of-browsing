// PROTOTYPE-ONLY FILE
// This file contains local mock daily entries, including accepted answers.
// Accepted answers are exposed here solely for the client-side prototype.
// TODO: In production, replace this with a server-side CMS or database lookup.
//       Answer validation must be done server-side. Accepted answers must
//       never be sent to the client in production.

import type { DailyEntry } from './types';

export const MOCK_ENTRIES: Record<string, DailyEntry> = {
  '2026-06-26': {
    entryNumber: 1,
    date: '2026-06-26',
    album: 'Unknown Pleasures',
    artist: 'Joy Division',
    year: 1979,
    genre: 'Post-Punk',
    coverImageUrl: '/mock/unknown-pleasures.jpg',
    editorialNote:
      'The signal from a dead pulsar, charted by scientists, stolen by a sleeve designer. White lines on black vinyl. The record that taught silence how to scream.',
    riddle:
      'The mountain breathes in white lines, but it is not a mountain. Scientists charted the death throes of a star; a designer made those lines eternal. The band named themselves after something dark found in a 1955 novel. Name the silence between each pulse.',
    // PROTOTYPE-ONLY: Never send accepted answers to the client in production.
    acceptedAnswers: [
      'Unknown Pleasures',
      'unknown pleasures',
    ],
    hints: [
      'The cover is a real data visualization, not an illustration.',
      'The band took their name from a chapter in a book about the Holocaust.',
    ],
    youtubeEmbedUrl: 'https://www.youtube.com/embed/y3OdBxM_gXY',
    deezerUrl: 'https://www.deezer.com/album/290',
    spotifyUrl: 'https://open.spotify.com/album/5lf9FXNiTSfGNKGl3KSQFK',
    appleMusicUrl: 'https://music.apple.com/album/unknown-pleasures/1474809763',
    youtubeMusicUrl: 'https://music.youtube.com/browse/MPREb_6qvQYyVq1WB',
  },

  '2026-06-27': {
    entryNumber: 2,
    date: '2026-06-27',
    album: 'Dummy',
    artist: 'Portishead',
    year: 1994,
    genre: 'Trip-Hop',
    coverImageUrl:
      'https://upload.wikimedia.org/wikipedia/en/7/70/Portishead_-_Dummy.png',
    editorialNote:
      'A city soaked in rain and static. Portishead built a ghost from film noir and broken samplers. Dummy arrived in 1994 and the world quietly agreed: this was grief, made beautiful.',
    riddle:
      'A city in England gave this band its name. The record samples spy film themes and loops them into heartbreak. The vocalist sounds like she is singing from the other side of something. Name the debut.',
    // PROTOTYPE-ONLY: Never send accepted answers to the client in production.
    acceptedAnswers: [
      'Dummy',
      'dummy',
      'Portishead Dummy',
    ],
    hints: [
      'The band is named after a small town near Bristol, England.',
      'The album spawned the song "Glory Box".',
    ],
    youtubeEmbedUrl: 'https://www.youtube.com/embed/WP5IaExMEQ4',
    deezerUrl: 'https://www.deezer.com/album/114487082',
    spotifyUrl: 'https://open.spotify.com/album/3539EbNgIdEDGBKkUf4wno',
    appleMusicUrl: 'https://music.apple.com/album/dummy/1422689918',
    youtubeMusicUrl: 'https://music.youtube.com/browse/MPREb_uH7kDAXMcOZ',
  },
};

/**
 * Returns the mock entry for the given day key, or the most recent available
 * entry as a fallback (for testing outside known mock dates).
 */
export function getMockEntryForDate(dateKey: string): DailyEntry | null {
  if (MOCK_ENTRIES[dateKey]) return MOCK_ENTRIES[dateKey];

  // Prototype fallback: return the first entry so the UI is always testable.
  // TODO: Remove this fallback once real CMS entries are in place.
  const keys = Object.keys(MOCK_ENTRIES).sort();
  if (keys.length === 0) return null;
  return MOCK_ENTRIES[keys[keys.length - 1]];
}
