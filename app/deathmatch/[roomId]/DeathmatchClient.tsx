'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import ObituaryHeader from '@/components/ui/ObituaryHeader';
import RoomLobby from '@/components/deathmatch/RoomLobby';
import DeathmatchRound from '@/components/deathmatch/DeathmatchRound';
import RoundReveal from '@/components/deathmatch/RoundReveal';
import Leaderboard from '@/components/deathmatch/Leaderboard';
import AnimatedScore from '@/components/ui/AnimatedScore';
import type { Portrait } from '@/lib/auth';

const PORTRAITS: Portrait[] = ['red', 'blue', 'green', 'yellow'];
const VALID_PORTRAITS = new Set<string>(PORTRAITS);

function toHandle(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '').slice(0, 20);
}

type PlayerGuess = { nickname: string; year: number; score: number; correct: boolean };

type RoomState = {
  id: string;
  status: 'lobby' | 'active' | 'finished';
  rounds: number;
  currentRound: number;
  currentEntry: { roundIndex: number; audioUrl: string } | null;
  revealedEntries: Array<{
    roundIndex: number;
    answerYear: number;
    albumTitle: string;
    artist: string;
    coverImageUrl: string;
    deezerAlbumUrl: string;
    trackTitle?: string;
    playerGuesses?: PlayerGuess[];
  }>;
  players: Array<{ nickname: string; hasGuessedCurrentRound: boolean }>;
  expiresAt: string;
  revealReadyAt?: number | null;
};

type GuessResult = {
  score: number;
  correct: boolean;
  band: string | null;
  direction: string | null;
  year: number;
};

type ClientPhase =
  | 'loading'
  | 'auth-gate'
  | 'lobby'
  | 'playing'
  | 'waiting'
  | 'revealing'
  | 'finished';

// auth-gate sub-steps for new users
type AuthStep = 'portrait' | 'details' | 'sent';

export default function DeathmatchClient({ roomId }: { roomId: string }) {
  const [phase, setPhase] = useState<ClientPhase>('loading');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [playerToken, setPlayerToken] = useState<string | null>(null);
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [myNickname, setMyNickname] = useState<string | null>(null);
  const [lastGuess, setLastGuess] = useState<GuessResult | null>(null);
  const [revealEntry, setRevealEntry] = useState<RoomState['revealedEntries'][0] | null>(null);
  const [revealCountdown, setRevealCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auth-gate state
  const [authStep, setAuthStep] = useState<AuthStep>('portrait');
  const [pendingPortrait, setPendingPortrait] = useState<Portrait | null>(null);
  const [pendingName, setPendingName] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const prevRoundRef = useRef<number>(-1);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (revealTimerRef.current) clearInterval(revealTimerRef.current); };
  }, []);

  const fetchRoom = useCallback(async (): Promise<RoomState | null> => {
    const res = await fetch(`/api/rooms/${roomId}`);
    if (!res.ok) return null;
    return res.json();
  }, [roomId]);

  const beginCountdown = useCallback((readyAt: number, finalStatus: string) => {
    if (revealTimerRef.current) clearInterval(revealTimerRef.current);
    const tick = () => {
      const remaining = Math.ceil((readyAt - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(revealTimerRef.current!);
        revealTimerRef.current = null;
        setRevealCountdown(null);
        setLastGuess(null);
        setRevealEntry(null);
        setPhase(finalStatus === 'finished' ? 'finished' : 'playing');
      } else {
        setRevealCountdown(remaining);
      }
    };
    tick();
    revealTimerRef.current = setInterval(tick, 500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const pt = localStorage.getItem(`tdb:room:${roomId}:token`);
    const ht = localStorage.getItem(`tdb:room:${roomId}:hostToken`);
    const nick = localStorage.getItem(`tdb:room:${roomId}:nickname`);
    setPlayerToken(pt);
    setHostToken(ht);
    if (nick) setMyNickname(nick);

    async function init() {
      const [r, meRes] = await Promise.all([
        fetchRoom(),
        fetch('/api/user/me').then(res => res.ok ? res.json() : null).catch(() => null),
      ]);

      if (!r) { setError('Room not found or expired'); return; }
      setRoom(r);

      if (pt) { resolvePhase(r, pt); return; }
      if (r.status === 'finished') { setPhase('finished'); return; }

      const isLoggedIn = !!meRes?.email;
      if (!isLoggedIn) {
        // Check for pending data left from the onboarding flow (after magic link redirect)
        // → no pending data yet, show auth-gate
        setPhase('auth-gate');
        return;
      }

      // Logged in — check for pending onboarding data saved before magic link
      const pendingPortraitKey = `tdb:room:${roomId}:pending-portrait`;
      const pendingNicknameKey = `tdb:room:${roomId}:pending-nickname`;
      const pendingHandleKey   = `tdb:room:${roomId}:pending-handle`;
      const savedPortrait  = localStorage.getItem(pendingPortraitKey);
      const savedNickname  = localStorage.getItem(pendingNicknameKey);
      const savedHandle    = localStorage.getItem(pendingHandleKey);

      // Apply portrait + username to account if freshly onboarded
      if (savedPortrait || savedHandle) {
        const updates: { portrait?: string; username?: string } = {};
        if (savedPortrait && VALID_PORTRAITS.has(savedPortrait)) updates.portrait = savedPortrait;
        if (savedHandle && !meRes.username) updates.username = savedHandle;
        if (Object.keys(updates).length > 0) {
          await fetch('/api/user/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          }).catch(() => {});
        }
        localStorage.removeItem(pendingPortraitKey);
        localStorage.removeItem(pendingHandleKey);
      }

      // Derive game nickname
      const nickname = savedNickname?.trim() || meRes.username || meRes.email.split('@')[0];
      if (savedNickname) localStorage.removeItem(pendingNicknameKey);

      const joinRes = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });
      const joinData = await joinRes.json();
      if (!joinRes.ok) {
        setError(joinData.error ?? 'Could not join room');
        setPhase('auth-gate');
        return;
      }
      localStorage.setItem(`tdb:room:${roomId}:token`, joinData.playerToken);
      localStorage.setItem(`tdb:room:${roomId}:nickname`, nickname);
      setPlayerToken(joinData.playerToken);
      setMyNickname(nickname);

      const fresh = await fetchRoom();
      if (fresh) { setRoom(fresh); resolvePhase(fresh, joinData.playerToken); }
    }

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  function resolvePhase(r: RoomState, _token: string) {
    if (r.status === 'lobby') { setPhase('lobby'); return; }
    if (r.status === 'finished') { setPhase('finished'); return; }
    setPhase('playing');
  }

  useEffect(() => {
    if (phase !== 'lobby' && phase !== 'playing' && phase !== 'waiting' && phase !== 'revealing') return;
    const interval = setInterval(async () => {
      const r = await fetchRoom();
      if (!r) return;
      setRoom(r);

      if (phase === 'lobby') {
        if (r.status === 'active') { prevRoundRef.current = r.currentRound; setPhase('playing'); }
        return;
      }

      if (phase === 'revealing') {
        if (r.revealReadyAt && !revealTimerRef.current) beginCountdown(r.revealReadyAt, r.status);
        return;
      }

      const oldRound = prevRoundRef.current;
      prevRoundRef.current = r.currentRound;
      if (r.currentRound !== oldRound && oldRound >= 0) {
        const justRevealed = r.revealedEntries.find(e => e.roundIndex === oldRound);
        if (justRevealed) { setRevealEntry(justRevealed); setPhase('revealing'); }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [phase, fetchRoom, beginCountdown]);

  // Auth-gate: submit email after portrait + name selected
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthError(null);

    const handle = toHandle(pendingName) || toHandle(pendingEmail.split('@')[0]);
    localStorage.setItem(`tdb:room:${roomId}:pending-portrait`, pendingPortrait ?? '');
    localStorage.setItem(`tdb:room:${roomId}:pending-nickname`, pendingName.trim());
    localStorage.setItem(`tdb:room:${roomId}:pending-handle`, handle);

    const res = await fetch('/api/auth/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingEmail.trim(), from: `/deathmatch/${roomId}` }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthError(data.error ?? 'Something went wrong. Try again.');
      setAuthSubmitting(false);
      return;
    }
    setAuthStep('sent');
    setAuthSubmitting(false);
  };

  const handleJoin = async (nickname: string) => {
    const res = await fetch(`/api/rooms/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Join failed');
    localStorage.setItem(`tdb:room:${roomId}:token`, data.playerToken);
    localStorage.setItem(`tdb:room:${roomId}:nickname`, nickname);
    setPlayerToken(data.playerToken);
    setMyNickname(nickname);
    const r = await fetchRoom();
    if (r) { setRoom(r); setPhase(r.status === 'lobby' ? 'lobby' : 'playing'); }
  };

  const handleStart = async () => {
    if (!hostToken) return;
    await fetch(`/api/rooms/${roomId}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostToken }),
    });
    const r = await fetchRoom();
    if (r) { setRoom(r); prevRoundRef.current = r.currentRound; setPhase('playing'); }
  };

  const handleAdvance = async () => {
    if (!hostToken) return;
    await fetch(`/api/rooms/${roomId}/advance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostToken }),
    });
    const r = await fetchRoom();
    if (r) setRoom(r);
  };

  const handleRevealReady = async () => {
    if (!hostToken || !room) return;
    const res = await fetch(`/api/rooms/${roomId}/ready`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostToken }),
    });
    if (!res.ok) return;
    const data = await res.json() as { revealReadyAt: number };
    beginCountdown(data.revealReadyAt, room.status);
  };

  const handleGuess = async (year: number): Promise<GuessResult> => {
    if (!playerToken || !room) throw new Error('Not connected');
    const res = await fetch(`/api/rooms/${roomId}/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${playerToken}` },
      body: JSON.stringify({ year, roundIndex: room.currentRound }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Guess failed');
    const result: GuessResult = { score: data.score, correct: data.correct, band: data.band, direction: data.direction, year };
    setLastGuess(result);
    setPhase('waiting');

    if (data.roundAdvanced) {
      const r = await fetchRoom();
      if (r) {
        setRoom(r);
        const justRevealed = r.revealedEntries.find(e => e.roundIndex === room.currentRound);
        if (justRevealed) {
          setRevealEntry(justRevealed);
          prevRoundRef.current = r.currentRound;
          setPhase('revealing');
        }
      }
    }
    return result;
  };

  if (error) return (
    <DeadBrowserShell>
      <ObituaryHeader entryNumber={0} entryDate="" />
      <div style={{ padding: '2rem 0', textAlign: 'center' }}>
        <p style={{ fontStyle: 'italic', color: 'var(--text-mid)' }}>{error}</p>
      </div>
    </DeadBrowserShell>
  );

  if (phase === 'loading' || !room) return (
    <DeadBrowserShell>
      <ObituaryHeader entryNumber={0} entryDate="" />
      <div style={{ padding: '2rem 0', textAlign: 'center' }}>
        <p className="font-heading animate-pulse-gold" style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Entering the room…
        </p>
      </div>
    </DeadBrowserShell>
  );

  return (
    <DeadBrowserShell>
      <ObituaryHeader entryNumber={0} entryDate="" />
      <div className="flex-1 flex flex-col gap-6 pb-8">

        {/* ── AUTH GATE ── */}
        {phase === 'auth-gate' && (
          <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '1rem' }}>

            <div>
              <p className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                Room · {room.rounds} rounds
              </p>
              <p className="font-brand" style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 0.95, color: 'var(--text)' }}>
                {authStep === 'sent' ? 'Check your email' : 'Join the game'}
              </p>
            </div>

            {/* Step 1 — portrait */}
            {authStep === 'portrait' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>
                  Choose your portrait to get started.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {PORTRAITS.map(p => (
                    <button
                      key={p}
                      onClick={() => { setPendingPortrait(p); setAuthStep('details'); }}
                      style={{
                        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                        borderRadius: '4px',
                        outline: pendingPortrait === p ? '2px solid var(--text)' : '2px solid transparent',
                        outlineOffset: '3px',
                        transition: 'outline-color 0.15s',
                      }}
                      aria-label={`${p} portrait`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/assets/portraits/portrait-${p}.png`}
                        alt={p}
                        style={{ width: 68, height: 68, display: 'block', borderRadius: '3px', objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — name + email */}
            {authStep === 'details' && (
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingPortrait && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/assets/portraits/portrait-${pendingPortrait}.png`}
                      alt={pendingPortrait}
                      style={{ width: 44, height: 44, borderRadius: '3px', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => setAuthStep('portrait')}
                      className="font-heading"
                      style={{ fontSize: '0.5rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Change
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label className="font-heading" style={{ fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                    Your name
                  </label>
                  <input
                    type="text"
                    value={pendingName}
                    onChange={e => setPendingName(e.target.value)}
                    maxLength={24}
                    placeholder="Shaun"
                    className="ritual-input font-brand"
                    style={{ fontSize: '2.4rem', padding: '0.25rem 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border-mid)', outline: 'none', color: 'var(--text)', width: '100%' }}
                    autoFocus
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label className="font-heading" style={{ fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={pendingEmail}
                    onChange={e => { setPendingEmail(e.target.value); setAuthError(null); }}
                    placeholder="your@email.com"
                    className="ritual-input"
                    style={{ padding: '0.55rem 0.6rem', fontSize: '0.95rem' }}
                    required
                  />
                </div>

                {authError && (
                  <p className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c41a1a' }}>
                    {authError}
                  </p>
                )}

                <button type="submit" className="btn-ghost" disabled={authSubmitting || !pendingName.trim() || !pendingEmail.trim()}>
                  {authSubmitting ? 'Sending…' : 'Get sign-in link'}
                </button>
              </form>
            )}

            {/* Step 3 — sent */}
            {authStep === 'sent' && (
              <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.75 }}>
                We sent a link to <strong style={{ color: 'var(--text)' }}>{pendingEmail}</strong>. Click it to join the room — the link expires in 15 minutes.
              </p>
            )}

          </div>
        )}

        {phase === 'lobby' && (
          <RoomLobby
            room={room}
            roomId={roomId}
            isHost={!!hostToken}
            isJoining={false}
            myNickname={myNickname}
            playerToken={playerToken}
            onJoin={handleJoin}
            onStart={handleStart}
          />
        )}

        {phase === 'playing' && room.currentEntry && (
          <DeathmatchRound
            key={room.currentRound}
            roundIndex={room.currentRound}
            totalRounds={room.rounds}
            audioUrl={room.currentEntry.audioUrl}
            players={room.players}
            onGuess={handleGuess}
            isHost={!!hostToken}
            onAdvance={handleAdvance}
          />
        )}

        {phase === 'waiting' && lastGuess && (
          <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center', paddingTop: '1.5rem' }}>
              <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                Round {room.currentRound + 1} / {room.rounds}
              </p>
              <p className="font-brand" style={{ fontSize: '3rem', fontWeight: 700, color: lastGuess.correct ? 'var(--text)' : '#c41a1a', lineHeight: 1 }}>
                <AnimatedScore target={lastGuess.score} />
              </p>
              <p className="font-heading" style={{ fontSize: '0.48rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                points
              </p>
              {lastGuess.score === 1000 && (
                <p className="font-heading animate-exact" style={{ fontSize: '0.72rem', letterSpacing: '0.38em', textTransform: 'uppercase', color: 'var(--text)', marginTop: '0.6rem' }}>
                  — exact year —
                </p>
              )}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                Waiting for others
              </p>
              {room.players.map(p => (
                <div key={p.nickname} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>
                    {p.nickname}
                  </span>
                  <span style={{ fontSize: '0.6rem', color: p.hasGuessedCurrentRound ? 'var(--text)' : 'var(--text-dim)' }}>
                    {p.hasGuessedCurrentRound ? '✓' : '…'}
                  </span>
                </div>
              ))}
            </div>
            {hostToken && (
              <button onClick={handleAdvance} className="btn-ghost" style={{ fontSize: '0.7rem' }}>
                Skip (host)
              </button>
            )}
          </div>
        )}

        {phase === 'revealing' && revealEntry && (
          <RoundReveal
            entry={revealEntry}
            score={lastGuess?.score ?? null}
            myYear={lastGuess?.year ?? null}
            myNickname={myNickname}
            isHost={!!hostToken}
            countdown={revealCountdown}
            onReady={handleRevealReady}
          />
        )}

        {phase === 'finished' && (
          <Leaderboard roomId={roomId} playerToken={playerToken} />
        )}

      </div>
    </DeadBrowserShell>
  );
}
