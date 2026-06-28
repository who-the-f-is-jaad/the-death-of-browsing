import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession, getUserById } from '@/lib/auth';
import { getUserStreak, getUserHistory } from '@/lib/db';
import { getFriendCount } from '@/lib/social';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = { title: 'Profile — THE DEATH OF BROWSING' };

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect('/signin?from=/profile');
  }

  const [streak, history, user, friendCount] = await Promise.all([
    getUserStreak(session.userId),
    getUserHistory(session.userId, 30),
    getUserById(session.userId),
    getFriendCount(session.userId),
  ]);

  return (
    <ProfileClient
      email={session.email}
      streak={streak}
      history={history}
      username={user?.username}
      portrait={user?.portrait}
      friendCount={friendCount}
    />
  );
}
