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
  | 'join'            // no token found, show nickname form
  | 'lobby'
  | 'playing'
  | 'waiting'         // guessed, waiting for others
  | 'revealing'       // brief reveal between rounds
  | 'finished';

export default function DeathmatchClient({ roomId }: { roomId: string }) {
  const [phase, setPhase] = useState<ClientPhase>('loading');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [playerToken, setPlayerToken] = useState<string | null>(null);
  const [hostToken, setHostToken] = useState<string | null>(null);
  const [myNickname, setMyNickname] = useState<string | null>(null);
  const [lastGuess, setLastGuess] = useState<GuessResult | null>(null);
  const [revealEntry, setRevealEntry] = useState<RoomState['revealedEntries'][0] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const prevRoundRef = useRef<number>(-1);
  const prevStatusRef = useRef<string>('');

  const fetchRoom = useCallback(async (): Promise<RoomState | null> => {
    const res = await fetch(`/api/rooms/${roomId}`);
    if (!res.ok) return null;
    return res.json();
  }, [roomId]);

  // Initial load: check localStorage for tokens + nickname, then fetch room
  useEffect(() => {
    const pt = localStorage.getItem(`tdb:room:${roomId}:token`);
    const ht = localStorage.getItem(`tdb:room:${roomId}:hostToken`);
    const nick = localStorage.getItem(`tdb:room:${roomId}:nickname`);
    setPlayerToken(pt);
    setHostToken(ht);
    if (nick) setMyNickname(nick);

    fetchRoom().then(r => {
      if (!r) { setError('Room not found or expired'); setPhase('loading'); return; }
      setRoom(r);
      if (!pt) {
        setPhase(r.status === 'finished' ? 'finished' : 'join');
      } else {
        resolvePhase(r, pt);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  function resolvePhase(r: RoomState, _token: string) {
    if (r.status === 'lobby') { setPhase('lobby'); return; }
    if (r.status === 'finished') { setPhase('finished'); return; }
    setPhase('playing');
  }

  // Polling — lobby (player list + game start) and active play (round advances)
  useEffect(() => {
    if (phase !== 'lobby' && phase !== 'playing' && phase !== 'waiting') return;

    const interval = setInterval(async () => {
      const r = await fetchRoom();
      if (!r) return;
      setRoom(r);

      // Lobby: detect when host starts the game
      if (phase === 'lobby') {
        if (r.status === 'active') {
          prevRoundRef.current = r.currentRound;
          setPhase('playing');
        }
        return;
      }

      // Playing/waiting: detect round advance
      if (r.currentRound !== prevRoundRef.current && prevRoundRef.current >= 0) {
        const justRevealed = r.revealedEntries.find(e => e.roundIndex === prevRoundRef.current);
        if (justRevealed) {
          setRevealEntry(justRevealed);
          setPhase('revealing');
          // Keep lastGuess so the reveal screen can show the player's guessed year
          setTimeout(() => {
            setLastGuess(null);
            setPhase(r.status === 'finished' ? 'finished' : 'playing');
          }, 4000);
        }
      }

      prevRoundRef.current = r.currentRound;
      prevStatusRef.current = r.status;

      if (r.status === 'finished') {
        setPhase('finished');
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [phase, fetchRoom]);

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

    // If last player caused advance, fetch fresh state
    if (data.roundAdvanced) {
      const r = await fetchRoom();
      if (r) {
        setRoom(r);
        const justRevealed = r.revealedEntries.find(e => e.roundIndex === room.currentRound);
        if (justRevealed) {
          setRevealEntry(justRevealed);
          prevRoundRef.current = r.currentRound;
          setTimeout(() => {
            setPhase(r.status === 'finished' ? 'finished' : 'playing');
            setLastGuess(null);
            setRevealEntry(null);
          }, 4000);
          setPhase('revealing');
        }
        if (r.status === 'finished') setPhase('finished');
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

        {(phase === 'join') && (
          <RoomLobby
            room={room}
            roomId={roomId}
            isHost={false}
            isJoining={true}
            onJoin={handleJoin}
            onStart={handleStart}
          />
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
          />
        )}

        {phase === 'finished' && (
          <Leaderboard roomId={roomId} playerToken={playerToken} />
        )}

      </div>
    </DeadBrowserShell>
  );
}
