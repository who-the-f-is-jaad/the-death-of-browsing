'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Status = 'loading' | 'logged_in' | 'idle' | 'submitting' | 'submitted' | 'dismissed';

export default function EmailCapture() {
  const [status, setStatus] = useState<Status>('loading');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('tdb:email-dismissed') === '1') {
      setStatus('dismissed');
      return;
    }
    fetch('/api/user/me')
      .then(r => r.json())
      .then(data => {
        if (data.email) {
          setUserEmail(data.email);
          setStatus('logged_in');
        } else {
          setStatus('idle');
        }
      })
      .catch(() => setStatus('idle'));
  }, []);

  const dismiss = useCallback(() => {
    sessionStorage.setItem('tdb:email-dismissed', '1');
    setStatus('dismissed');
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError('Something went wrong. Try again.');
        setStatus('idle');
        return;
      }
      setStatus('submitted');
      if (data.verifyUrl) setDevLink(data.verifyUrl);
    } catch {
      setError('Something went wrong. Try again.');
      setStatus('idle');
    }
  }, [email]);

  if (status === 'loading' || status === 'dismissed') return null;

  const wrapStyle: React.CSSProperties = {
    borderTop: '1px solid var(--border)',
    paddingTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  };

  if (status === 'logged_in') {
    return (
      <div style={wrapStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Signed in as {userEmail}
          </p>
          <Link
            href="/profile"
            className="font-heading"
            style={{ fontSize: '0.5rem', letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none', borderBottom: '1px solid var(--border-mid)', paddingBottom: '1px' }}
          >
            Profile
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'submitted') {
    return (
      <div style={wrapStyle}>
        <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
          Check your email — the sign-in link expires in 15 minutes.
        </p>
        {devLink && (
          <a href={devLink} style={{ fontSize: '0.62rem', color: 'var(--text-dim)', wordBreak: 'break-all' }}>
            [dev] {devLink}
          </a>
        )}
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <p style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-mid)', lineHeight: 1.75 }}>
        Keep your streak across devices. Enter your email to sign in.
      </p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(null); }}
          placeholder="your@email.com"
          autoComplete="email"
          disabled={status === 'submitting'}
          className="ritual-input"
          style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.875rem' }}
        />
        {error && (
          <p className="font-heading" style={{ fontSize: '0.52rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--crimson-hi)' }}>
            {error}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="btn-ghost"
            style={{ flex: 1 }}
          >
            {status === 'submitting' ? 'Sending...' : 'Continue with email'}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="btn-text"
            style={{ flexShrink: 0, fontSize: '0.65rem' }}
          >
            No thanks
          </button>
        </div>
      </form>
    </div>
  );
}
