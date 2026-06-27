import { NextResponse } from 'next/server';
import { getRoom, setRoom, getAllPlayers } from '@/lib/roomStorage';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  const { hostToken } = await req.json() as { hostToken: string };

  const room = await getRoom(roomId);
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  if (room.hostToken !== hostToken) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (room.status !== 'lobby') return NextResponse.json({ error: 'Room already started' }, { status: 409 });

  const players = await getAllPlayers(roomId);
  if (players.length < 1) {
    return NextResponse.json({ error: 'Need at least 1 player' }, { status: 400 });
  }

  room.status = 'active';
  await setRoom(room);
  return NextResponse.json({ ok: true });
}
