'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { COPY } from '@/lib/copy';

// TODO: Validate invite codes via Supabase. Codes are single-use, beta-access only.

export default function InvitePage() {
  const params = useParams();
  const codeFromUrl = typeof params?.code === 'string' ? params.code : '';

  const [code, setCode] = useState(codeFromUrl);
  const [status, setStatus] = useState<'idle' | 'loading' | 'invalid' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus('loading');
    // TODO: Replace with real server-side invite validation.
    await new Promise((r) => setTimeout(r, 800));
    setStatus('invalid');
  };

  return (
    <div className="flex-1 flex flex-col gap-8">
      <header>
        <a
          href="/"
          className="font-brand tracking-widest uppercase"
          style={{ color: 'var(--text-dim)', fontSize: '0.55rem', letterSpacing: '0.2em' }}
        >
          {COPY.appName}
        </a>
      </header>

      <div className="card p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1
            className="font-heading text-2xl"
            style={{ color: 'var(--text-primary)' }}
          >
            {COPY.inviteTitle}
          </h1>
          <p
            className="font-serif text-sm leading-relaxed italic"
            style={{ color: 'var(--text-secondary)' }}
          >
            {COPY.inviteSubtext}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="invite-code"
              className="font-heading text-xs tracking-widest uppercase"
              style={{ color: 'var(--text-dim)' }}
            >
              {COPY.inviteInputLabel}
            </label>
            <input
              id="invite-code"
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setStatus('idle'); }}
              placeholder="XXXX-XXXX"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="ritual-input"
              aria-describedby={status === 'invalid' ? 'invite-error' : undefined}
            />
          </div>

          {status === 'invalid' && (
            <p
              id="invite-error"
              className="font-serif text-sm italic"
              style={{ color: 'var(--text-blood)' }}
              role="alert"
            >
              {COPY.inviteInvalid}
            </p>
          )}

          {status === 'success' && (
            <p
              className="font-heading text-sm tracking-wide"
              style={{ color: 'var(--gold)' }}
              role="status"
            >
              {COPY.inviteSuccess}
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || !code.trim()}
            className="btn-primary"
          >
            {status === 'loading' ? COPY.loading : COPY.inviteSubmitLabel}
          </button>
        </form>
      </div>

      <footer className="flex justify-center">
        <a
          href="/"
          className="font-heading text-xs tracking-widest uppercase"
          style={{ color: 'var(--text-dim)' }}
        >
          Return
        </a>
      </footer>
    </div>
  );
}
