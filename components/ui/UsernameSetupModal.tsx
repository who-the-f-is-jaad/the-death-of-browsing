'use client';

import { useState, useEffect } from 'react';

interface Props {
  onComplete: (username: string, displayName: string) => void;
}

export default function UsernameSetupModal({ onComplete }: Props) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Slight delay so it doesn't flash immediately
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim().toLowerCase(), displayName: displayName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        setSaving(false);
        return;
      }
      onComplete(data.username, data.displayName);
    } catch {
      setError('Could not reach the server.');
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(5,5,5,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="animate-fadein"
        style={{
          width: '100%', maxWidth: '420px',
          background: '#0a0a0a',
          border: '1px solid var(--border-mid)',
          padding: '2rem 1.5rem',
          display: 'flex', flexDirection: 'column', gap: '1.5rem',
        }}
      >
        <div>
          <p className="font-heading" style={{ fontSize: '0.76rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
            Claim your identity
          </p>
          <p style={{ fontSize: '1.1rem', color: '#ffffff', lineHeight: 1.4 }}>
            Choose a handle.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', lineHeight: 1.6, marginTop: '0.4rem' }}>
            Your profile will be visible at /u/@handle. You can change it later.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="font-heading" style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              @handle
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              maxLength={20}
              placeholder="shaun"
              className="ritual-input"
              style={{ fontSize: '1.4rem', padding: '0.4rem 0.25rem' }}
              autoFocus
              required
            />
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>3–20 characters. Letters, numbers, underscores.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="font-heading" style={{ fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              Display name <span style={{ opacity: 0.5 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={32}
              placeholder="Shaun"
              className="ritual-input"
              style={{ fontSize: '1.1rem', padding: '0.4rem 0.25rem' }}
            />
          </div>

          {error && (
            <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#c41a1a' }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn-ghost"
            disabled={saving || username.length < 3}
            style={{ marginTop: '0.25rem' }}
          >
            {saving ? 'Claiming…' : 'Claim handle'}
          </button>
        </form>
      </div>
    </div>
  );
}
