import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getUserByUsername, getSession } from '@/lib/auth';
import { getUserPublicStats } from '@/lib/db';
import { getFollowerCount, getFollowingCount, isFollowing } from '@/lib/social';
import PublicProfileClient from './PublicProfileClient';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username.toLowerCase());
  if (!user) return { title: 'Not found — THE DEATH OF BROWSING' };
  const display = user.displayName ?? user.username ?? username;
  return { title: `${display} (@${user.username}) — THE DEATH OF BROWSING` };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const handle = username.toLowerCase();

  const user = await getUserByUsername(handle);
  if (!user || !user.username) notFound();

  const [stats, followerCount, followingCount, session] = await Promise.all([
    getUserPublicStats(user.id),
    getFollowerCount(user.id),
    getFollowingCount(user.id),
    getSession(),
  ]);

  const viewerIsFollowing = session?.userId && session.userId !== user.id
    ? await isFollowing(session.userId, user.id)
    : false;

  const isOwnProfile = session?.userId === user.id;

  return (
    <PublicProfileClient
      username={user.username}
      displayName={user.displayName ?? user.username}
      portrait={user.portrait}
      stats={stats}
      followerCount={followerCount}
      followingCount={followingCount}
      viewerIsFollowing={viewerIsFollowing}
      isOwnProfile={isOwnProfile}
    />
  );
}
