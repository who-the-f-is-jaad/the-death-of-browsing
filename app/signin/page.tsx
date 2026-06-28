import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import SignInClient from './SignInClient';

export const metadata: Metadata = { title: 'Sign in — THE DEATH OF BROWSING' };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await getSession();
  const { from } = await searchParams;

  // Already logged in — go to the intended destination or profile
  if (session) {
    redirect(from && from.startsWith('/') ? from : '/profile');
  }

  return <SignInClient from={from && from.startsWith('/') ? from : '/profile'} />;
}
