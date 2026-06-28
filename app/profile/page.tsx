import type { Metadata } from 'next';
import { getSession, getUserById } from '@/lib/auth';
import { getUserStreak, getUserHistory } from '@/lib/db';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = { title: 'Profile — THE DEATH OF BROWSING' };

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    return <ProfileClient loggedIn={false} />;
  }

  const [streak, history, user] = await Promise.all([
    getUserStreak(session.userId),
    getUserHistory(session.userId, 30),
    getUserById(session.userId),
  ]);

  return (
    <ProfileClient
      loggedIn={true}
      email={session.email}
      streak={streak}
      history={history}
      username={user?.username}
      displayName={user?.displayName}
    />
  );
}
