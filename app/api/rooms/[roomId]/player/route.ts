import { NextResponse } from 'next/server';
import { getRoom, renamePlayer, updatePlayerPortrait } from '@/lib/roomStorage';

const VALID_PORTRAITS = new Set(['red', 'blue', 'green', 'yellow']);

function getToken(req: Request): string | null {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7).trim();
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  const playerToken = getToken(req);
  if (!playerToken) return NextResponse.json({ error: 'Missing token' }, { status: 401 });

  const body = await req.json() as { nickname?: string; portrait?: string };

  const room = await getRoom(roomId);
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

  if (body.portrait !== undefined) {
    if (!VALID_PORTRAITS.has(body.portrait)) {
      return NextResponse.json({ error: 'Invalid portrait' }, { status: 400 });
    }
    const result = await updatePlayerPortrait(roomId, playerToken, body.portrait);
    if (result === 'not_found') return NextResponse.json({ error: 'Not in this room' }, { status: 403 });
    return NextResponse.json({ ok: true, portrait: body.portrait });
  }

  if (body.nickname !== undefined) {
    if (room.status !== 'lobby') {
      return NextResponse.json({ error: 'Cannot rename after game has started' }, { status: 409 });
    }
    const trimmed = body.nickname.trim();
    if (!trimmed || trimmed.length < 1 || trimmed.length > 24) {
      return NextResponse.json({ error: 'Invalid nickname' }, { status: 400 });
    }
    const result = await renamePlayer(roomId, playerToken, trimmed);
    if (result === 'not_found') return NextResponse.json({ error: 'Not in this room' }, { status: 403 });
    if (result === 'taken') return NextResponse.json({ error: 'Name already taken' }, { status: 409 });
    return NextResponse.json({ ok: true, nickname: trimmed });
  }

  return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
}
