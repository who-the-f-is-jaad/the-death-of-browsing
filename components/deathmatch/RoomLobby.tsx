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
  const [nickname, setNickname] = useState('Shaun');
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/deathmatch/${roomId}`
    : `/deathmatch/${roomId}`;

  const hostName = room.players[0]?.nickname ?? '';

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

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'THE DEATH OF BROWSING',
          text: 'Come guess the year with me.',
          url: inviteUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  // Guest joining: show name input
  if (isJoining) {
    return (
      <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '1rem' }}>
        <div>
          <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
            Room · {room.rounds} rounds
          </p>
          <p className="font-brand" style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 0.95, color: 'var(--text)' }}>
            Enter
          </p>
        </div>

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="font-heading" style={{ fontSize: '0.48rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              Your name
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
          {joinError && (
            <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: '#c41a1a' }}>
              {joinError}
            </p>
          )}
          <button type="submit" className="btn-ghost" disabled={joining || !nickname.trim()}>
            {joining ? 'Joining…' : 'Join game'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '1rem' }}>

      {/* Identity */}
      <div>
        <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
          {isHost ? 'you are' : 'waiting in'} · {room.rounds} rounds
        </p>
        <p className="font-brand" style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 0.95, color: 'var(--text)', textTransform: 'uppercase' }}>
          {isHost ? hostName : 'Lobby'}
        </p>
      </div>

      {/* Invite */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p className="font-heading" style={{ fontSize: '0.48rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Invite link
        </p>
        <code style={{ fontSize: '0.72rem', color: 'var(--text-mid)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
          {inviteUrl}
        </code>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleInvite}
            className="btn-ghost"
            style={{ flex: 1 }}
          >
            Invite friends
          </button>
          <button
            onClick={handleCopy}
            className="btn-ghost"
            style={{ flex: 1 }}
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      </div>

      {/* Players */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p className="font-heading" style={{ fontSize: '0.48rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Players ({room.players.length}/10)
        </p>
        {room.players.length === 0 ? (
          <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-dim)' }}>
            No players yet.
          </p>
        ) : room.players.map((p, i) => (
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
      </div>

      {/* Host controls */}
      {isHost && (
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

      {/* Guest waiting */}
      {!isHost && (
        <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-dim)', textAlign: 'center' }}>
          Waiting for the host to start…
        </p>
      )}

    </div>
  );
}
