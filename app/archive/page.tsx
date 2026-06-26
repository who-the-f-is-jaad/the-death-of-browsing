import type { Metadata } from 'next';
import { COPY } from '@/lib/copy';

export const metadata: Metadata = {
  title: `${COPY.archiveTitle} — THE DEATH OF BROWSING`,
};

export default function ArchivePage() {
  return (
    <div className="flex-1 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <a
          href="/"
          className="font-brand tracking-widest uppercase"
          style={{ color: 'var(--text-dim)', fontSize: '0.55rem', letterSpacing: '0.2em' }}
        >
          {COPY.appName}
        </a>
        <h1
          className="font-heading text-2xl"
          style={{ color: 'var(--text-primary)' }}
        >
          {COPY.archiveTitle}
        </h1>
        <p
          className="font-serif text-sm italic"
          style={{ color: 'var(--text-secondary)' }}
        >
          {COPY.archiveSubtext}
        </p>
      </header>

      <span className="rule-gold" style={{ margin: '0' }} />

      {/* TODO: Populate from CMS/Supabase once integrated. */}
      <div className="flex-1 flex items-center justify-center">
        <p
          className="font-serif text-sm italic"
          style={{ color: 'var(--text-secondary)' }}
        >
          {COPY.archiveEmpty}
        </p>
      </div>

      <footer className="flex justify-center">
        <a
          href="/"
          className="font-heading text-xs tracking-widest uppercase"
          style={{ color: 'var(--text-dim)' }}
        >
          Return
        </a>
      </footer>
    </div>
  );
}
