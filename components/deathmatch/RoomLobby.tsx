'use client';

import { useState } from 'react';

type RoomState = {
  id: string;
  status: 'lobby' | 'active' | 'finished';
  rounds: number;
  currentRound: number;
  players: Array<{ nickname: string; hasGuessedCurrentRound: boolean }>;
  expiresAt: string;
};

interface Props {
  room: RoomState;
  roomId: string;
  isHost: boolean;
  isJoining: boolean;
  onJoin: (nickname: string) => Promise<void>;
  onStart: () => Promise<void>;
}

export default function RoomLobby({ room, roomId, isHost, isJoining, onJoin, onStart }: Props) {
  const [nickname, setNickname] = useState('');
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/deathmatch/${roomId}`
    : `/deathmatch/${roomId}`;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    setJoining(true);
    setJoinError(null);
    try {
      await onJoin(nickname.trim());
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Join failed');
      setJoining(false);
    }
  };

  const handleStart = async () => {
    setStarting(true);
    await onStart();
    setStarting(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl).catch(() => {});
  };

  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Title */}
      <div style={{ paddingTop: '0.5rem' }}>
        <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
          Room · {room.rounds} rounds
        </p>
        <p className="font-brand" style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 0.95, color: 'var(--text)' }}>
          Lobby
        </p>
      </div>

      {/* Invite link */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <p className="font-heading" style={{ fontSize: '0.48rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Invite link
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <code style={{ flex: 1, fontSize: '0.75rem', color: 'var(--text-mid)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {inviteUrl}
          </code>
          <button
            onClick={handleCopyLink}
            className="btn-ghost"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.65rem', flexShrink: 0 }}
          >
            Copy
          </button>
        </div>
      </div>

      {/* Players */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p className="font-heading" style={{ fontSize: '0.48rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Players ({room.players.length}/10)
        </p>
        {room.players.map((p, i) => (
          <div key={p.nickname} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', minWidth: '1rem' }}>
              {i + 1}
            </span>
            <span className="font-heading" style={{ fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text)' }}>
              {p.nickname}
            </span>
            {i === 0 && (
              <span className="font-heading" style={{ fontSize: '0.4rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                host
              </span>
            )}
          </div>
        ))}
        {room.players.length === 0 && (
          <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-dim)' }}>
            No players yet.
          </p>
        )}
      </div>

      {/* Join form (shown when guest lands on room URL without a token) */}
      {isJoining && (
        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="font-heading" style={{ fontSize: '0.48rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
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
          {joinError && (
            <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: '#c41a1a' }}>
              {joinError}
            </p>
          )}
          <button type="submit" className="btn-ghost" disabled={joining || !nickname.trim()}>
            {joining ? 'Joining…' : 'Join room'}
          </button>
        </form>
      )}

      {/* Host controls */}
      {isHost && !isJoining && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={handleStart}
            className="btn-ghost"
            disabled={starting || room.players.length < 1}
          >
            {starting ? 'Starting…' : 'Start game'}
          </button>
          {room.players.length < 2 && (
            <p style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              Waiting for at least one more player…
            </p>
          )}
        </div>
      )}

      {/* Non-host waiting message */}
      {!isHost && !isJoining && (
        <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-dim)', textAlign: 'center' }}>
          Waiting for the host to start the game…
        </p>
      )}

    </div>
  );
}
