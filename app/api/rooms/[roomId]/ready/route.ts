import { NextResponse } from 'next/server';
import { getRoom, setRoom } from '@/lib/roomStorage';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  const { hostToken } = await req.json() as { hostToken: string };

  const room = await getRoom(roomId);
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  if (room.hostToken !== hostToken) return NextResponse.json({ error: 'Not host' }, { status: 403 });

  const revealReadyAt = Date.now() + 3000;
  room.revealReadyAt = revealReadyAt;
  await setRoom(room);

  return NextResponse.json({ ok: true, revealReadyAt });
}
