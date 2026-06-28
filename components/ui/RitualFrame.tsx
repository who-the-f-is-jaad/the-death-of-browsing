// Thin-border inscription frame. No corner ornaments, no double borders.
// Just a clean photocopied border with subtle inner shadow.

import { cn } from '@/lib/classNames';

interface Props {
  children: React.ReactNode;
  className?: string;
  label?: string;
  variant?: 'default' | 'raised' | 'blood';
}

export default function RitualFrame({ children, className, label, variant = 'default' }: Props) {
  const borderColor =
    variant === 'blood' ? 'rgba(122,18,18,0.4)' :
    variant === 'raised' ? 'var(--border-hi)' :
    'var(--border-mid)';

  return (
    <div
      className={cn('inscription', className)}
      style={{ borderColor }}
    >
      {label && (
        <p
          className="font-heading"
          style={{
            fontSize: '0.84rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            marginBottom: '0.75rem',
          }}
        >
          {label}
        </p>
      )}
      {children}
    </div>
  );
}
