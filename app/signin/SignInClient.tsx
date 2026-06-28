'use client';

import { useState } from 'react';
import Link from 'next/link';
import DeadBrowserShell from '@/components/ui/DeadBrowserShell';

interface Props {
  from: string;
}

export default function SignInClient({ from }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }
    setError(null);
    setStatus('submitting');
    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, from }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError('Something went wrong. Try again.');
        setStatus('idle');
        return;
      }
      setStatus('sent');
      if (data.verifyUrl) setDevLink(data.verifyUrl);
    } catch {
      setError('Something went wrong. Try again.');
      setStatus('idle');
    }
  };

  return (
    <DeadBrowserShell>
      <div style={{ padding: '2rem 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <p className="font-heading" style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          THE DEATH OF BROWSING
        </p>
        <p className="font-heading" style={{ fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)' }}>
          Sign in
        </p>
      </div>

      <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem', paddingTop: '1rem' }}>
        {status === 'sent' ? (
          <>
            <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.75 }}>
              Check your email — the sign-in link expires in 15 minutes.
            </p>
            {devLink && (
              <a href={devLink} style={{ fontSize: '0.62rem', color: 'var(--text-dim)', wordBreak: 'break-all' }}>
                [dev] {devLink}
              </a>
            )}
          </>
        ) : (
          <>
            <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.75 }}>
              No password. Enter your email and we&apos;ll send a sign-in link.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null); }}
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                disabled={status === 'submitting'}
                className="ritual-input"
                style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.875rem' }}
              />
              {error && (
                <p className="font-heading" style={{ fontSize: '0.52rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--crimson-hi)' }}>
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="btn-ghost"
              >
                {status === 'submitting' ? 'Sending…' : 'Continue with email'}
              </button>
            </form>
          </>
        )}
      </div>

      <footer style={{ borderTop: '1px solid var(--border-mid)', padding: '1.25rem 0', textAlign: 'center' }}>
        <Link
          href="/"
          className="font-heading"
          style={{ fontSize: '0.52rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none' }}
        >
          Back to today&apos;s omen
        </Link>
      </footer>
    </DeadBrowserShell>
  );
}
