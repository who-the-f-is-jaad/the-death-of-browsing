// Prototype only: see omenSheet.ts prototype warning.

import type { AudioOmenEntry } from './omenTypes';

export function extractDeezerTrackId(url: string): string | null {
  // Support: https://www.deezer.com/track/123, https://www.deezer.com/fr/track/123, etc.
  const match = url.match(/deezer\.com(?:\/[a-z]{2})?\/track\/(\d+)/);
  return match ? match[1] : null;
}

function isShortLink(url: string): boolean {
  return url.includes('link.deezer.com') || url.includes('deezer.page.link');
}

async function resolveShortLink(url: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/deezer/resolve?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.resolvedUrl ?? null;
  } catch {
    return null;
  }
}

interface DeezerTrack {
  id?: number;
  title?: string;
  preview?: string;
  link?: string;
  artist?: { name?: string };
  album?: {
    id?: number;
    title?: string;
    cover_big?: string;
    cover_xl?: string;
    link?: string;
  };
}

interface DeezerAlbum {
  title?: string;
  link?: string;
  cover_big?: string;
  cover_xl?: string;
  release_date?: string;
  artist?: { name?: string };
}

async function fetchDeezerTrack(trackId: string): Promise<DeezerTrack | null> {
  try {
    const res = await fetch(`/api/deezer/track/${trackId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchDeezerAlbum(albumId: number): Promise<DeezerAlbum | null> {
  try {
    const res = await fetch(`/api/deezer/album/${albumId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function enrichFromDeezer(
  deezerTrackUrl: string,
  answerYear: number,
  date: string,
): Promise<AudioOmenEntry | null> {
  let resolvedUrl = deezerTrackUrl;
  if (isShortLink(deezerTrackUrl)) {
    resolvedUrl = (await resolveShortLink(deezerTrackUrl)) ?? deezerTrackUrl;
  }

  const trackId = extractDeezerTrackId(resolvedUrl);
  if (!trackId) return null;

  const track = await fetchDeezerTrack(trackId);
  if (!track) return null;

  let album: DeezerAlbum | null = null;
  if (track.album?.id) {
    album = await fetchDeezerAlbum(track.album.id);
  }

  const audioUrl = track.preview ?? '';
  const coverImageUrl = album?.cover_xl ?? album?.cover_big ?? track.album?.cover_xl ?? track.album?.cover_big ?? '';
  const albumTitle = album?.title ?? track.album?.title ?? 'Unknown Album';
  const artist = album?.artist?.name ?? track.artist?.name ?? 'Unknown Artist';
  const deezerAlbumUrl = album?.link ?? track.album?.link ?? deezerTrackUrl;

  const entryId = `${date}:${trackId}:${answerYear}`;

  return {
    id: entryId,
    dateUtc: date,
    audioOmen: {
      audioUrl,
      audioSource: 'deezer_preview',
      answerYear,
      maxAttempts: 3,
    },
    track: {
      title: track.title,
      deezerUrl: track.link,
    },
    album: {
      title: albumTitle,
      artist,
      coverImageUrl: coverImageUrl || undefined,
      deezerUrl: deezerAlbumUrl,
    },
  };
}
