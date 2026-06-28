'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import ObituaryHeader from '@/components/ui/ObituaryHeader';

export default function DeathmatchPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('Shaun');
  const [rounds, setRounds] = useState<3 | 5 | 10>(3);
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
        body: JSON.stringify({ rounds, nickname: nickname.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create room');

      // Persist tokens before redirecting
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
      <div className="flex-1 flex flex-col gap-6 pb-8">
        <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ paddingTop: '1rem' }}>
            <p className="font-brand" style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 0.9, color: 'var(--text)' }}>
              Deathmatch
            </p>
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-mid)', marginTop: '0.75rem', lineHeight: 1.6 }}>
              Create a room. Share the link. Everyone hears the same records — closest guess wins the round.
            </p>
          </div>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                Your nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                maxLength={24}
                placeholder="e.g. GraveDigger"
                className="ritual-input"
                style={{ fontSize: '1.1rem', padding: '0.5rem 0.25rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                Rounds
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {([3, 5, 10] as const).map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRounds(n)}
                    className="font-heading"
                    style={{
                      flex: 1,
                      padding: '0.6rem 0',
                      border: `1px solid ${rounds === n ? 'var(--text)' : 'var(--border-mid)'}`,
                      background: 'none',
                      color: rounds === n ? 'var(--text)' : 'var(--text-dim)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      letterSpacing: '0.12em',
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
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
      </div>
    </DeadBrowserShell>
  );
}
