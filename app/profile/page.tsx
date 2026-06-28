import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession, getUserById } from '@/lib/auth';
import { getUserStreak, getUserHistory, getUserPublicStats, getBestSoloScore } from '@/lib/db';
import { getFriendCount } from '@/lib/social';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = { title: 'Profile — THE DEATH OF BROWSING' };

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect('/signin?from=/profile');
  }

  const [history, user, stats, friendCount, bestSolo] = await Promise.all([
    getUserHistory(session.userId, 30),
    getUserById(session.userId),
    getUserPublicStats(session.userId),
    getFriendCount(session.userId),
    getBestSoloScore(session.userId),
  ]);

  return (
    <ProfileClient
      email={session.email}
      history={history}
      username={user?.username}
      portrait={user?.portrait}
      stats={stats}
      friendCount={friendCount}
      bestSolo={bestSolo ?? null}
    />
  );
}
