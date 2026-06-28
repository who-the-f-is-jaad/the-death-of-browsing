import { NextResponse } from 'next/server';
import { getRoom, getAllPlayers, addPlayerToRoom, isNicknameTaken, generateToken } from '@/lib/roomStorage';
import { getSession, getUserById } from '@/lib/auth';
import { addFriends } from '@/lib/social';
import type { Player } from '@/lib/roomTypes';

const MAX_PLAYERS = 10;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  const { nickname } = await req.json() as { nickname: string };

  const nick = nickname?.trim();
  if (!nick || nick.length < 1 || nick.length > 24) {
    return NextResponse.json({ error: 'nickname must be 1–24 characters' }, { status: 400 });
  }

  const room = await getRoom(roomId);
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  if (room.status === 'finished') {
    return NextResponse.json({ error: 'Room has ended' }, { status: 410 });
  }

  const players = await getAllPlayers(roomId);
  if (players.length >= MAX_PLAYERS) {
    return NextResponse.json({ error: 'Room is full' }, { status: 409 });
  }

  if (await isNicknameTaken(roomId, nick)) {
    return NextResponse.json({ error: 'Nickname already taken' }, { status: 409 });
  }

  const playerToken = generateToken();
  const session = await getSession();
  const joinerUser = session ? await getUserById(session.userId) : null;
  const player: Player = {
    token: playerToken,
    nickname: nick,
    ...(joinerUser?.portrait ? { portrait: joinerUser.portrait } : {}),
    joinedAt: new Date().toISOString(),
    guesses: [],
  };

  await addPlayerToRoom(roomId, player);

  if (session && room.hostUserId && session.userId !== room.hostUserId) {
    addFriends(session.userId, room.hostUserId).catch(() => {});
  }

  return NextResponse.json({ playerToken });
}
