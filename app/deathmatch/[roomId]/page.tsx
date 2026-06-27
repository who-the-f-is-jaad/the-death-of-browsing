import DeathmatchClient from './DeathmatchClient';

export default async function DeathmatchRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <DeathmatchClient roomId={roomId} />;
}
