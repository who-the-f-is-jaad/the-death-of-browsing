'use client';

import { useState, useRef } from 'react';

const PORTRAITS = ['red', 'blue', 'green', 'yellow'] as const;

type RoomState = {
  id: string;
  status: 'lobby' | 'active' | 'finished';
  rounds: number;
  currentRound: number;
  players: Array<{ nickname: string; portrait: string | null; hasGuessedCurrentRound: boolean }>;
  expiresAt: string;
};

interface Props {
  room: RoomState;
  roomId: string;
  isHost: boolean;
  isJoining: boolean;
  myNickname: string | null;
  playerToken: string | null;
  onJoin: (nickname: string) => Promise<void>;
  onStart: () => Promise<void>;
  onPortraitChange: (portrait: string) => Promise<void>;
}

function Portrait({ src, size = 44 }: { src: string | null; size?: number }) {
  if (!src) {
    return (
      <div style={{ width: size, height: size, borderRadius: '3px', background: 'var(--border)', flexShrink: 0 }} />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/assets/portraits/portrait-${src}.png`}
      alt=""
      style={{ width: size, height: size, borderRadius: '3px', objectFit: 'cover', flexShrink: 0 }}
    />
  );
}

export default function RoomLobby({ room, roomId, isHost, isJoining, myNickname, playerToken, onJoin, onStart, onPortraitChange }: Props) {
  const [nickname, setNickname] = useState('');
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [changingPortrait, setChangingPortrait] = useState(false);

  // Rename state
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(myNickname ?? '');
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/deathmatch/${roomId}`
    : `/deathmatch/${roomId}`;

  const hostName = room.players[0]?.nickname ?? '';
  const myPlayer = room.players.find(p => p.nickname === myNickname);
  const myPortrait = myPlayer?.portrait ?? null;

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
        await navigator.share({ title: 'THE DEATH OF BROWSING', text: 'Come guess the year with me.', url: inviteUrl });
      } catch { /* user cancelled */ }
    } else {
      handleCopy();
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === myNickname || !playerToken) { setEditingName(false); return; }
    setRenaming(true);
    setRenameError(null);
    const res = await fetch(`/api/rooms/${roomId}/player`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${playerToken}` },
      body: JSON.stringify({ nickname: trimmed }),
    });
    const data = await res.json();
    setRenaming(false);
    if (!res.ok) { setRenameError(data.error ?? 'Name taken'); return; }
    setEditingName(false);
    window.location.reload();
  };

  const handlePortraitPick = async (portrait: string) => {
    if (portrait === myPortrait || changingPortrait) return;
    setChangingPortrait(true);
    await onPortraitChange(portrait);
    setChangingPortrait(false);
  };

  // Guest joining: show name input
  if (isJoining) {
    return (
      <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingTop: '1rem' }}>
        <div>
          <p className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
            Room · {room.rounds} rounds
          </p>
          <p className="font-brand" style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 0.95, color: 'var(--text)' }}>
            Enter
          </p>
        </div>
        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label className="font-heading" style={{ fontSize: '0.76rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
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
          {joinError && <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: '#c41a1a' }}>{joinError}</p>}
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
        <p className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
          {isHost ? 'you are' : 'waiting in'} · {room.rounds} rounds
        </p>
        <p className="font-brand" style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 0.95, color: 'var(--text)', textTransform: 'uppercase' }}>
          {isHost ? hostName : 'Lobby'}
        </p>
      </div>

      {/* Portrait picker for current user */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p className="font-heading" style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Your portrait
        </p>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {PORTRAITS.map(p => (
            <button
              key={p}
              onClick={() => handlePortraitPick(p)}
              disabled={changingPortrait}
              style={{
                background: 'none', border: 'none', padding: 0,
                cursor: changingPortrait ? 'default' : 'pointer',
                borderRadius: '4px',
                outline: myPortrait === p ? '2px solid var(--text)' : '2px solid transparent',
                outlineOffset: '3px',
                opacity: changingPortrait && myPortrait !== p ? 0.4 : 1,
                transition: 'outline-color 0.15s, opacity 0.15s',
              }}
              aria-label={`${p} portrait`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/assets/portraits/portrait-${p}.png`}
                alt={p}
                style={{ width: 56, height: 56, display: 'block', borderRadius: '3px', objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Invite */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p className="font-heading" style={{ fontSize: '0.76rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Invite link
        </p>
        <code style={{ fontSize: '0.92rem', color: 'var(--text-mid)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
          {inviteUrl}
        </code>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleInvite} className="btn-ghost" style={{ flex: 1 }}>Invite friends</button>
          <button onClick={handleCopy} className="btn-ghost" style={{ flex: 1 }}>{copied ? 'Copied!' : 'Copy link'}</button>
        </div>
      </div>

      {/* Players */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p className="font-heading" style={{ fontSize: '0.76rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Players ({room.players.length}/10)
        </p>
        {room.players.map((p, i) => {
          const isMe = p.nickname === myNickname;
          return (
            <div key={p.nickname} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0', borderBottom: '1px solid var(--border)' }}>
              <Portrait src={p.portrait} size={40} />

              <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)', minWidth: '1rem' }}>{i + 1}</span>

              {isMe && editingName ? (
                <form onSubmit={handleRenameSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                  <input
                    ref={nameInputRef}
                    type="text"
                    value={nameInput}
                    onChange={e => { setNameInput(e.target.value); setRenameError(null); }}
                    maxLength={24}
                    autoFocus
                    className="ritual-input font-heading"
                    style={{ fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'none', border: 'none', borderBottom: '1px solid var(--border-mid)', outline: 'none', color: 'var(--text)', flex: 1, padding: '0 0.1rem' }}
                    onBlur={handleRenameSubmit as unknown as React.FocusEventHandler}
                  />
                  <button type="submit" disabled={renaming} className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.12em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: '0 0.25rem' }}>
                    {renaming ? '…' : 'OK'}
                  </button>
                </form>
              ) : (
                <span className="font-heading" style={{ fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text)', flex: 1 }}>
                  {p.nickname}
                </span>
              )}

              {i === 0 && !editingName && (
                <span className="font-heading" style={{ fontSize: '0.4rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                  host
                </span>
              )}
              {isMe && !editingName && (
                <button
                  onClick={() => { setNameInput(myNickname ?? ''); setEditingName(true); }}
                  className="font-heading"
                  style={{ fontSize: '0.42rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.25rem', opacity: 0.6 }}
                >
                  edit
                </button>
              )}
            </div>
          );
        })}
        {renameError && <p style={{ fontStyle: 'italic', fontSize: '0.8rem', color: '#c41a1a' }}>{renameError}</p>}
      </div>

      {/* Host controls */}
      {isHost && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button onClick={handleStart} className="btn-ghost" disabled={starting || room.players.length < 1}>
            {starting ? 'Starting…' : 'Start game'}
          </button>
          {room.players.length < 2 && (
            <p style={{ fontStyle: 'italic', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              Waiting for at least one more player…
            </p>
          )}
        </div>
      )}

      {!isHost && (
        <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-dim)', textAlign: 'center' }}>
          Waiting for the host to start…
        </p>
      )}

    </div>
  );
}
