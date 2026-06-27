import Link from 'next/link';

interface Props {
  entryNumber: number;
  entryDate: string;
  streakNode?: React.ReactNode;
}

export default function ObituaryHeader({ entryNumber, entryDate: _entryDate, streakNode }: Props) {
  return (
    <header className="cat-header">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Link href="/" className="cat-brand" style={{ textDecoration: 'none' }}>
          The Death of Browsing
        </Link>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
          {streakNode}
          <span className="cat-entry font-heading">
            № {String(entryNumber).padStart(3, '0')}
          </span>
        </div>
      </div>
      <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.4, marginTop: '0.35rem' }}>
        Stop scrolling. Start listening.
      </p>
    </header>
  );
}
