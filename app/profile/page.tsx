import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession, getUserById } from '@/lib/auth';
import { getUserPublicStats, getBestSoloScore, getUnlockedPortraits, getUserCoins } from '@/lib/db';
import { getFriendCount } from '@/lib/social';
import { FREE_PORTRAIT_IDS } from '@/lib/portraitConfig';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = { title: 'Profile — THE DEATH OF BROWSING' };

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect('/signin?from=/profile');
  }

  const [user, stats, friendCount, bestSolo, paidUnlocks, coins] = await Promise.all([
    getUserById(session.userId),
    getUserPublicStats(session.userId),
    getFriendCount(session.userId),
    getBestSoloScore(session.userId),
    getUnlockedPortraits(session.userId),
    getUserCoins(session.userId),
  ]);

  const unlockedPortraits = [...FREE_PORTRAIT_IDS, ...paidUnlocks];

  return (
    <ProfileClient
      email={session.email}
      username={user?.username}
      portrait={user?.portrait}
      stats={stats}
      friendCount={friendCount}
      bestSolo={bestSolo ?? null}
      unlockedPortraits={unlockedPortraits}
      coins={coins}
    />
  );
}
