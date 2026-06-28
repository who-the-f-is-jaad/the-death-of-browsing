'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type FriendStatus = 'none' | 'friends' | 'sent' | 'incoming';

interface Props {
  username: string;
  status: FriendStatus;
}

export default function FriendButton({ username, status: initialStatus }: Props) {
  const [status, setStatus] = useState<FriendStatus>(initialStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const call = async (method: string, body?: object): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/${username}/friend`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.status === 401) { router.push('/profile'); return false; }
      return res.ok;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  };

  const btnStyle: React.CSSProperties = {
    fontSize: '0.84rem',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    padding: '0.5rem 1rem',
    opacity: loading ? 0.5 : 1,
  };

  if (status === 'friends') {
    return (
      <button
        onClick={async () => { if (await call('DELETE')) { setStatus('none'); router.refresh(); } }}
        disabled={loading}
        className="btn-ghost font-heading"
        style={{ ...btnStyle, background: 'var(--border-mid)' }}
      >
        {loading ? '…' : 'Friends ✓'}
      </button>
    );
  }

  if (status === 'sent') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span className="font-heading" style={{ fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Request sent
        </span>
        <button
          onClick={async () => { if (await call('DELETE')) setStatus('none'); }}
          disabled={loading}
          className="font-heading"
          style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: loading ? 0.4 : 0.6 }}
        >
          Cancel
        </button>
      </div>
    );
  }

  if (status === 'incoming') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={async () => { if (await call('PATCH', { action: 'accept' })) { setStatus('friends'); router.refresh(); } }}
          disabled={loading}
          className="btn-ghost font-heading"
          style={{ fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.4rem 0.75rem', opacity: loading ? 0.5 : 1 }}
        >
          Accept
        </button>
        <button
          onClick={async () => { if (await call('PATCH', { action: 'reject' })) setStatus('none'); }}
          disabled={loading}
          className="font-heading"
          style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem 0.5rem', opacity: loading ? 0.4 : 0.6 }}
        >
          Decline
        </button>
      </div>
    );
  }

  // 'none'
  return (
    <button
      onClick={async () => { if (await call('POST')) setStatus('sent'); }}
      disabled={loading}
      className="btn-ghost font-heading"
      style={btnStyle}
    >
      {loading ? '…' : 'Add friend'}
    </button>
  );
}
