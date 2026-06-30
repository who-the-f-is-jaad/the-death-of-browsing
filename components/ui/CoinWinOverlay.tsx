'use client';

import { useEffect, useState } from 'react';

interface Props {
  coins: number;
  delayMs?: number;
}

export default function CoinWinOverlay({ coins, delayMs = 0 }: Props) {
  const [visible, setVisible] = useState(delayMs === 0);
  const [out, setOut] = useState(false);

  useEffect(() => {
    if (coins <= 0) return;
    let showTimer: ReturnType<typeof setTimeout>;
    if (delayMs > 0) {
      showTimer = setTimeout(() => setVisible(true), delayMs);
    }
    const outTimer = setTimeout(() => setOut(true), delayMs + 3200);
    return () => { clearTimeout(showTimer); clearTimeout(outTimer); };
  }, [coins, delayMs]);

  if (coins <= 0 || !visible || out) return null;

  return (
    <div
      onClick={() => setOut(true)}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        cursor: 'pointer',
        animation: 'cwBg 0.35s ease forwards',
      }}
    >
      <style>{`
        @keyframes cwBg  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cwPop {
          0%   { opacity: 0; transform: scale(0.55) translateY(28px); }
          55%  { opacity: 1; transform: scale(1.06) translateY(-5px); }
          75%  { transform: scale(0.98) translateY(2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes cwCoin {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          45%       { transform: translateY(-14px) rotate(4deg); }
          70%       { transform: translateY(-6px) rotate(-2deg); }
        }
        .cw-card { animation: cwPop 0.55s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
        .cw-coin { animation: cwCoin 1.4s 0.4s ease-in-out infinite; display: block; }
      `}</style>
      <div
        className="cw-card"
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
          background: 'var(--surface)',
          border: '1px solid var(--border-hi)',
          padding: '2.75rem 4rem',
          textAlign: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="cw-coin" src="/assets/coin.png" alt="" width={52} height={52} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <p className="font-brand" style={{ fontSize: '3.2rem', color: '#ffffff', fontWeight: 700, lineHeight: 1 }}>
            +{coins.toFixed(1)}
          </p>
          <p className="font-heading" style={{ fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-mid)' }}>
            coins earned
          </p>
        </div>
        <p className="font-heading" style={{ fontSize: '0.58rem', letterSpacing: '0.12em', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
          tap to continue
        </p>
      </div>
    </div>
  );
}
