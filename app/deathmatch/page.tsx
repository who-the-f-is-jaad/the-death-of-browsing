'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import ObituaryHeader from '@/components/ui/ObituaryHeader';

type View = 'choice' | 'host' | 'join';

export default function DeathmatchPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('choice');
  const [nickname, setNickname] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loggedInNick, setLoggedInNick] = useState<string | null>(null);
  const [meLoading, setMeLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.username || data?.email) {
          setLoggedInNick(data.username ?? data.email.split('@')[0]);
        }
      })
      .catch(() => {})
      .finally(() => setMeLoading(false));
  }, []);

  const handleHost = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const nick = (loggedInNick ?? nickname).trim();
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rounds: 5, nickname: nick }),
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

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    router.push(`/deathmatch/${code}`);
  };

  const headingStyle = { fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: 'var(--text-dim)' };

  return (
    <DeadBrowserShell>
      <ObituaryHeader entryNumber={0} entryDate="" />
      <div className="flex-1 flex flex-col pb-8">

        {/* Choice screen */}
        {view === 'choice' && (
          <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '1.5rem' }}>
            <div>
              <p className="font-heading" style={headingStyle}>Multiplayer</p>
              <p className="font-brand" style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 0.9, color: 'var(--text)', marginTop: '0.3rem' }}>
                Deathmatch
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn-ghost" onClick={() => setView('host')}>
                Host a room
              </button>
              <button className="btn-ghost" onClick={() => setView('join')}>
                Join with code
              </button>
            </div>
          </div>
        )}

        {/* Host flow */}
        {view === 'host' && !meLoading && (
          <form
            onSubmit={handleHost}
            className="animate-fadein"
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '1.5rem' }}
          >
            <div>
              <button
                type="button"
                onClick={() => { setView('choice'); setError(null); }}
                className="font-heading"
                style={{ ...headingStyle, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '0.75rem', display: 'block' }}
              >
                ← Back
              </button>
              <p className="font-brand" style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 0.95, color: 'var(--text)' }}>
                {loggedInNick ? `@${loggedInNick}` : 'Your name'}
              </p>
            </div>

            {!loggedInNick && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label className="font-heading" style={headingStyle}>Nickname</label>
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
            )}

            {error && (
              <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--crimson-hi)' }}>{error}</p>
            )}

            <button
              type="submit"
              className="btn-ghost"
              disabled={loading || (!loggedInNick && !nickname.trim())}
            >
              {loading ? 'Summoning the room…' : 'Create room · 5 rounds'}
            </button>
          </form>
        )}

        {/* Join flow */}
        {view === 'join' && (
          <form
            onSubmit={handleJoin}
            className="animate-fadein"
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '1.5rem' }}
          >
            <div>
              <button
                type="button"
                onClick={() => { setView('choice'); setError(null); }}
                className="font-heading"
                style={{ ...headingStyle, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '0.75rem', display: 'block' }}
              >
                ← Back
              </button>
              <p className="font-brand" style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 0.95, color: 'var(--text)' }}>
                Enter code
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label className="font-heading" style={headingStyle}>Room code</label>
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                placeholder="AB12CD34"
                className="ritual-input font-brand"
                style={{ fontSize: '2.8rem', padding: '0.25rem 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border-mid)', outline: 'none', color: 'var(--text)', width: '100%', letterSpacing: '0.15em' }}
                required
                autoFocus
                autoComplete="off"
              />
            </div>

            <button
              type="submit"
              className="btn-ghost"
              disabled={joinCode.trim().length < 6}
            >
              Join room
            </button>
          </form>
        )}

      </div>
    </DeadBrowserShell>
  );
}
