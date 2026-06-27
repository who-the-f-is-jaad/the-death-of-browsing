import Link from 'next/link';

interface Props {
  entryNumber: number;
  entryDate: string;
  streakNode?: React.ReactNode;
}

export default function ObituaryHeader({ entryNumber, entryDate: _entryDate, streakNode }: Props) {

  return (
    <header className="cat-header">
      <Link href="/" className="cat-brand" style={{ textDecoration: 'none' }}>
        The Death of Browsing
      </Link>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        {streakNode}
        <span className="cat-entry font-heading">
          № {String(entryNumber).padStart(3, '0')}
        </span>
      </div>
    </header>
  );
}
