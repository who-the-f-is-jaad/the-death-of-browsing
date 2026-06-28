'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  username: string;
  initialFollowing: boolean;
}

export default function FollowButton({ username, initialFollowing }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/${username}/follow`, {
        method: following ? 'DELETE' : 'POST',
      });
      if (res.status === 401) {
        // Not logged in — redirect to profile to sign in
        router.push('/profile');
        return;
      }
      if (res.ok) {
        setFollowing(f => !f);
        router.refresh(); // revalidate server component counts
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="btn-ghost font-heading"
      style={{
        fontSize: '0.52rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        padding: '0.5rem 1rem',
        opacity: loading ? 0.5 : 1,
        background: following ? 'var(--border-mid)' : 'none',
      }}
    >
      {loading ? '…' : following ? 'Following' : 'Follow'}
    </button>
  );
}
