'use client';

import { useState, useEffect } from 'react';

interface Props {
  onComplete: (username: string) => void;
}

function toHandle(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20);
}

export default function UsernameSetupModal({ onComplete }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  const handle = toHandle(name);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.length < 3) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: handle }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        setSaving(false);
        return;
      }
      onComplete(data.username);
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
            Choose your name.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(null); }}
              maxLength={32}
              placeholder="Shaun"
              className="ritual-input font-brand"
              style={{ fontSize: '2.8rem', padding: '0.25rem 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border-mid)', outline: 'none', color: 'var(--text)', width: '100%' }}
              autoFocus
              required
            />
            <p className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: handle.length >= 3 ? 'var(--text-dim)' : 'transparent' }}>
              @{handle || '…'}
            </p>
          </div>

          {error && (
            <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#c41a1a' }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn-ghost"
            disabled={saving || handle.length < 3}
            style={{ marginTop: '0.25rem' }}
          >
            {saving ? 'Saving…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
