import { NextResponse } from 'next/server';
import { getRoom, setRoom } from '@/lib/roomStorage';

// Host-only: force advance past current round (e.g. a player is AFK)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  const { hostToken } = await req.json() as { hostToken: string };

  const room = await getRoom(roomId);
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  if (room.hostToken !== hostToken) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (room.status !== 'active') return NextResponse.json({ error: 'Room is not active' }, { status: 409 });

  room.currentRound++;
  if (room.currentRound >= room.rounds) {
    room.status = 'finished';
  }
  await setRoom(room);
  return NextResponse.json({ currentRound: room.currentRound, status: room.status });
}
