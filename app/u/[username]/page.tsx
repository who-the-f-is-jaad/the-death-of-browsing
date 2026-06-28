import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getUserByUsername, getSession } from '@/lib/auth';
import { getUserPublicStats } from '@/lib/db';
import { getFriendCount, getFriendStatus } from '@/lib/social';
import PublicProfileClient from './PublicProfileClient';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username.toLowerCase());
  if (!user) return { title: 'Not found — THE DEATH OF BROWSING' };
  const display = user.username ?? username;
  return { title: `${display} (@${user.username}) — THE DEATH OF BROWSING` };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const handle = username.toLowerCase();

  const user = await getUserByUsername(handle);
  if (!user || !user.username) notFound();

  const [stats, friendCount, session] = await Promise.all([
    getUserPublicStats(user.id),
    getFriendCount(user.id),
    getSession(),
  ]);

  const isOwnProfile = session?.userId === user.id;
  const friendStatus = session?.userId && !isOwnProfile
    ? await getFriendStatus(session.userId, user.id)
    : 'none';

  return (
    <PublicProfileClient
      username={user.username}
      portrait={user.portrait}
      stats={stats}
      friendCount={friendCount}
      friendStatus={friendStatus}
      isOwnProfile={isOwnProfile}
    />
  );
}
