'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Portrait } from '@/lib/auth';

interface FriendRequest {
  username: string;
  portrait: Portrait | null;
}

interface Props {
  requests: FriendRequest[];
}

export default function RequestList({ requests: initial }: Props) {
  const [requests, setRequests] = useState(initial);
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  if (requests.length === 0) return null;

  const handle = async (username: string, action: 'accept' | 'reject') => {
    setLoading(`${username}:${action}`);
    try {
      await fetch(`/api/user/${username}/friend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      setRequests(r => r.filter(req => req.username !== username));
      if (action === 'accept') router.refresh();
    } catch {
      // silent
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p className="font-heading" style={{ fontSize: '0.78rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>
        Friend requests ({requests.length})
      </p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {requests.map(req => (
          <div
            key={req.username}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}
          >
            {req.portrait && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/assets/portraits/portrait-${req.portrait}.png`}
                alt=""
                style={{ width: 36, height: 36, borderRadius: '3px', objectFit: 'cover', flexShrink: 0 }}
              />
            )}
            <Link
              href={`/u/${req.username}`}
              style={{ textDecoration: 'none', color: '#ffffff', fontSize: '0.95rem', flex: 1 }}
            >
              @{req.username}
            </Link>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handle(req.username, 'accept')}
                disabled={!!loading}
                className="btn-ghost font-heading"
                style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '0.35rem 0.65rem', opacity: loading ? 0.5 : 1 }}
              >
                Accept
              </button>
              <button
                onClick={() => handle(req.username, 'reject')}
                disabled={!!loading}
                className="font-heading"
                style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.35rem 0.5rem', opacity: loading ? 0.4 : 0.6 }}
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
