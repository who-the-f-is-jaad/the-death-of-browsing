// Minimal catalog header: brand left, entry number right.
// Feels like a running head in a printed catalog or zine.

interface Props {
  entryNumber: number;
  entryDate: string;
  streakNode?: React.ReactNode;
}

export default function ObituaryHeader({ entryNumber, entryDate: _entryDate, streakNode }: Props) {

  return (
    <header className="cat-header">
      <span className="cat-brand">The Death of Browsing</span>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        {streakNode}
        <span className="cat-entry font-heading">
          № {String(entryNumber).padStart(3, '0')}
        </span>
      </div>
    </header>
  );
}
