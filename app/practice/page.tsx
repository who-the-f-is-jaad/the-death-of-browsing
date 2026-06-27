import type { Metadata } from 'next';
import PracticeClient from './PracticeClient';

export const metadata: Metadata = { title: 'Practice — THE DEATH OF BROWSING' };

export default function PracticePage() {
  return <PracticeClient />;
}
