'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import ObituaryHeader from '@/components/ui/ObituaryHeader';
import RoomLobby from '@/components/deathmatch/RoomLobby';
import DeathmatchRound from '@/components/deathmatch/DeathmatchRound';
import RoundReveal from '@/components/deathmatch/RoundReveal';
import Leaderboard from '@/components/deathmatch/Leaderboard';
import AnimatedScore from '@/components/ui/AnimatedScore';

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
  | 'auth-gate'       // not logged in → prompt sign-in
  | 'lobby'
  | 'playing'
  | 'waiting'         // guessed, waiting for others
  | 'revealing'       // round reveal — host clicks "Ready" to advance
  | 'finished';

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

  const prevRoundRef = useRef<number>(-1);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear countdown interval on unmount
  useEffect(() => {
    return () => { if (revealTimerRef.current) clearInterval(revealTimerRef.current); };
  }, []);

  const fetchRoom = useCallback(async (): Promise<RoomState | null> => {
    const res = await fetch(`/api/rooms/${roomId}`);
    if (!res.ok) return null;
    return res.json();
  }, [roomId]);

  // Start a 3-second countdown then transition to next phase
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
  }, []); // state setters are stable

  // Initial load: check tokens + auth status, auto-join if logged in
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

      // Already in room (returning visitor / host)
      if (pt) { resolvePhase(r, pt); return; }

      // Room finished — nothing to join
      if (r.status === 'finished') { setPhase('finished'); return; }

      const isLoggedIn = !!meRes?.email;
      if (!isLoggedIn) { setPhase('auth-gate'); return; }

      // Auto-join with account name (no form needed)
      const name: string = meRes.displayName ?? meRes.username ?? (meRes.email as string).split('@')[0];
      const joinRes = await fetch(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: name }),
      });
      const joinData = await joinRes.json();
      if (!joinRes.ok) {
        setError(joinData.error ?? 'Could not join room');
        setPhase('auth-gate');
        return;
      }
      localStorage.setItem(`tdb:room:${roomId}:token`, joinData.playerToken);
      localStorage.setItem(`tdb:room:${roomId}:nickname`, name);
      setPlayerToken(joinData.playerToken);
      setMyNickname(name);

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

  // Polling — lobby/playing/waiting detect state changes; revealing waits for host "Ready"
  useEffect(() => {
    if (
      phase !== 'lobby' &&
      phase !== 'playing' &&
      phase !== 'waiting' &&
      phase !== 'revealing'
    ) return;

    const interval = setInterval(async () => {
      const r = await fetchRoom();
      if (!r) return;
      setRoom(r);

      if (phase === 'lobby') {
        if (r.status === 'active') {
          prevRoundRef.current = r.currentRound;
          setPhase('playing');
        }
        return;
      }

      // In reveal: detect when host has clicked "Ready"
      if (phase === 'revealing') {
        if (r.revealReadyAt && !revealTimerRef.current) {
          beginCountdown(r.revealReadyAt, r.status);
        }
        return;
      }

      // Playing/waiting: detect round advance (non-host / late-guessing path)
      const oldRound = prevRoundRef.current;
      prevRoundRef.current = r.currentRound;

      if (r.currentRound !== oldRound && oldRound >= 0) {
        const justRevealed = r.revealedEntries.find(e => e.roundIndex === oldRound);
        if (justRevealed) {
          setRevealEntry(justRevealed);
          setPhase('revealing');
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [phase, fetchRoom, beginCountdown]);

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

  // Host clicks "Ready" during reveal → 3-second countdown for all clients
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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${playerToken}`,
      },
      body: JSON.stringify({ year, roundIndex: room.currentRound }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Guess failed');

    const result: GuessResult = { score: data.score, correct: data.correct, band: data.band, direction: data.direction, year };
    setLastGuess(result);
    setPhase('waiting');

    // If last player to guess triggered the advance, show reveal immediately
    if (data.roundAdvanced) {
      const r = await fetchRoom();
      if (r) {
        setRoom(r);
        const justRevealed = r.revealedEntries.find(e => e.roundIndex === room.currentRound);
        if (justRevealed) {
          setRevealEntry(justRevealed);
          prevRoundRef.current = r.currentRound;
          setPhase('revealing');
          // Host will click "Ready" to advance — no auto-timeout
        }
        // Do NOT call setPhase('finished') here even if r.status === 'finished':
        // the reveal for the last round must show first.
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

        {phase === 'auth-gate' && (
          <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '1rem' }}>
            <div>
              <p className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                Room · {room.rounds} rounds
              </p>
              <p className="font-brand" style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 0.95, color: 'var(--text)' }}>
                Sign in to play
              </p>
            </div>
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>
              {error
                ? error
                : 'You need an account to join a deathmatch game.'}
            </p>
            <a
              href={`/signin?from=/deathmatch/${roomId}`}
              className="btn-ghost"
              style={{ textAlign: 'center', textDecoration: 'none' }}
            >
              Sign in
            </a>
          </div>
        )}

        {phase === 'lobby' && (
          <RoomLobby
            room={room}
            roomId={roomId}
            isHost={!!hostToken}
            isJoining={false}
            onJoin={handleJoin}
            onStart={handleStart}
          />
        )}

        {(phase === 'playing') && room.currentEntry && (
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

        {phase === 'waiting' && room && lastGuess && (
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
