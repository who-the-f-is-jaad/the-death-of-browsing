'use client';

import { cn } from '@/lib/classNames';

type Variant = 'gold' | 'crimson' | 'ghost';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export default function AngularButton({
  children,
  variant = 'gold',
  fullWidth = false,
  className,
  disabled,
  ...props
}: Props) {
  // Map old variant names to new CSS classes
  const cls =
    variant === 'crimson' ? 'btn-primary' :
    variant === 'ghost'   ? 'btn-ghost' :
    'btn-ghost'; // 'gold' → ghost in the new monochrome system

  return (
    <button
      className={cn(cls, fullWidth && 'w-full', className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
