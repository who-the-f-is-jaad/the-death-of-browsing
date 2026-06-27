import { NextResponse } from 'next/server';
import { getRoom, getAllPlayers, addPlayerToRoom, isNicknameTaken, generateToken } from '@/lib/roomStorage';
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
  const player: Player = {
    token: playerToken,
    nickname: nick,
    joinedAt: new Date().toISOString(),
    guesses: [],
  };

  await addPlayerToRoom(roomId, player);
  return NextResponse.json({ playerToken });
}
