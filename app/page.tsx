'use client';

import { useState, useEffect } from 'react';
import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import ObituaryHeader from '@/components/ui/ObituaryHeader';
import IntroScreen from '@/components/daily/IntroScreen';
import SealedEntry from '@/components/daily/SealedEntry';

export default function HomePage() {
  const [introComplete, setIntroComplete] = useState(false);
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('tdb:intro-seen') === '1') {
      setIntroComplete(true);
    }
  }, []);

  useEffect(() => {
    fetch('/api/user/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (typeof data?.coins === 'number') setCoins(data.coins); })
      .catch(() => {});
  }, []);

  if (!introComplete) {
    return <IntroScreen onComplete={() => setIntroComplete(true)} />;
  }

  const coinNode = coins !== null
    ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/coin.png" alt="" width={16} height={16} style={{ display: 'block', opacity: 0.85 }} />
        <span className="font-heading" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', color: 'var(--text-mid)', lineHeight: 1 }}>
          {coins}
        </span>
      </div>
    )
    : undefined;

  return (
    <DeadBrowserShell>
      <ObituaryHeader entryNumber={0} entryDate="" leftNode={coinNode} />

      <div className="flex-1 flex flex-col gap-6 pb-8">
        <SealedEntry />
      </div>

      <footer>
        <nav
          className="flex justify-center gap-8 py-4"
          style={{ borderTop: '1px solid var(--border-mid)' }}
          aria-label="Site navigation"
        >
          {[
            { label: 'Archive', href: '/archive' },
            { label: 'About', href: '/about' },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="font-heading text-xs tracking-widest uppercase transition-colors"
              style={{ color: 'var(--text-dim)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-dim)'; }}
            >
              {label}
            </a>
          ))}
        </nav>
        <div style={{ textAlign: 'center', paddingBottom: '1.5rem' }}>
          <p style={{ fontStyle: 'italic', fontSize: '0.92rem', color: '#ffffff', lineHeight: 1.6 }}>
            Browsing, the sheep, hoped that you knew the difference between the synth-pop of 1983 and the synth-pop of 1984.
          </p>
        </div>
      </footer>
    </DeadBrowserShell>
  );
}
