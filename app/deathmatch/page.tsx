'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import ObituaryHeader from '@/components/ui/ObituaryHeader';

export default function DeathmatchPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('Shaun');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rounds: 3, nickname: nickname.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create room');

      localStorage.setItem(`tdb:room:${data.roomId}:token`, data.playerToken);
      localStorage.setItem(`tdb:room:${data.roomId}:hostToken`, data.hostToken);

      router.push(`/deathmatch/${data.roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  return (
    <DeadBrowserShell>
      <ObituaryHeader entryNumber={0} entryDate="" />
      <div className="flex-1 flex flex-col pb-8">
        <form
          onSubmit={handleCreate}
          className="animate-fadein"
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '1.5rem' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label
              className="font-heading"
              style={{ fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}
            >
              Your nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              maxLength={24}
              placeholder="Shaun"
              className="ritual-input font-brand"
              style={{ fontSize: '3rem', padding: '0.25rem 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border-mid)', outline: 'none', color: 'var(--text)', width: '100%', textTransform: 'uppercase' }}
              required
              autoFocus
            />
          </div>

          {error && (
            <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--crimson-hi)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn-ghost"
            disabled={loading || !nickname.trim()}
          >
            {loading ? 'Summoning the room…' : 'Create room'}
          </button>
        </form>
      </div>
    </DeadBrowserShell>
  );
}
