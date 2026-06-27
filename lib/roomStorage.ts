import 'server-only';
import { kv } from '@vercel/kv';
import type { Room, Player, RoundGuess } from './roomTypes';

const ROOM_TTL = 86400;    // 24 hours
const PREVIEW_TTL = 3300;  // 55 minutes

const rk  = (id: string)                   => `tdb:room:${id}`;
const pk  = (id: string, token: string)    => `tdb:room:${id}:player:${token}`;
const psk = (id: string)                   => `tdb:room:${id}:players`;
const nk  = (id: string)                   => `tdb:room:${id}:nicknames`;

export async function getRoom(roomId: string): Promise<Room | null> {
  return kv.get<Room>(rk(roomId));
}

export async function setRoom(room: Room): Promise<void> {
  await kv.set(rk(room.id), room, { ex: ROOM_TTL });
}

export async function getPlayer(roomId: string, token: string): Promise<Player | null> {
  return kv.get<Player>(pk(roomId, token));
}

export async function setPlayer(roomId: string, player: Player): Promise<void> {
  await kv.set(pk(roomId, player.token), player, { ex: ROOM_TTL });
}

export async function getPlayerTokens(roomId: string): Promise<string[]> {
  const result = await kv.smembers(psk(roomId));
  return (result ?? []) as string[];
}

export async function getAllPlayers(roomId: string): Promise<Player[]> {
  const tokens = await getPlayerTokens(roomId);
  if (tokens.length === 0) return [];
  const players = await Promise.all(tokens.map(t => getPlayer(roomId, t)));
  return players.filter((p): p is Player => p !== null);
}

export async function addPlayerToRoom(roomId: string, player: Player): Promise<void> {
  await Promise.all([
    kv.set(pk(roomId, player.token), player, { ex: ROOM_TTL }),
    kv.sadd(psk(roomId), player.token),
    kv.expire(psk(roomId), ROOM_TTL),
    kv.sadd(nk(roomId), player.nickname),
    kv.expire(nk(roomId), ROOM_TTL),
  ]);
}

export async function isNicknameTaken(roomId: string, nickname: string): Promise<boolean> {
  const result = await kv.sismember(nk(roomId), nickname);
  return result === 1;
}

export async function addGuessToPlayer(
  roomId: string,
  token: string,
  guess: RoundGuess,
): Promise<Player | null> {
  const player = await getPlayer(roomId, token);
  if (!player) return null;
  // Replace any previous guess for this round (shouldn't normally happen due to 409 guard)
  player.guesses = [...player.guesses.filter(g => g.roundIndex !== guess.roundIndex), guess];
  await setPlayer(roomId, player);
  return player;
}

export async function getCachedPreview(trackId: string): Promise<string | null> {
  return kv.get<string>(`tdb:preview:${trackId}`);
}

export async function setCachedPreview(trackId: string, url: string): Promise<void> {
  await kv.set(`tdb:preview:${trackId}`, url, { ex: PREVIEW_TTL });
}

export function generateRoomId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
}

export function generateToken(): string {
  return crypto.randomUUID();
}
