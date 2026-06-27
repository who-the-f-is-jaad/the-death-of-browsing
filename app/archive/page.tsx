import type { Metadata } from 'next';
import ArchiveClient from './ArchiveClient';

export const metadata: Metadata = {
  title: 'Archive — THE DEATH OF BROWSING',
};

export default function ArchivePage() {
  return <ArchiveClient />;
}
