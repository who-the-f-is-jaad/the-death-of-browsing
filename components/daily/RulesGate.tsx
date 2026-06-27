'use client';

import { playClick } from '@/lib/clickSound';

interface Props {
  onBegin: () => void;
}

const RULES = [
  'Listen to a fragment of sound.',
  'Name the year it was born.',
  'Three attempts before silence falls.',
  'The album reveals itself at the end.',
];

const NUMERALS = ['I', 'II', 'III', 'IV'];

export default function RulesGate({ onBegin }: Props) {
  return (
    <div className="animate-fadein" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="photo-frame" style={{ width: '52%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/sheep-card.jpg"
            alt=""
            style={{ width: '100%', display: 'block', filter: 'grayscale(20%) contrast(1.1)', opacity: 0.85 }}
          />
        </div>
      </div>

      <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.75, textAlign: 'center' }}>
        The sheep knows the answer.<br />It will not tell you.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {RULES.map((rule, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'baseline', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <span className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.16em', color: 'var(--text-dim)', flexShrink: 0, minWidth: '1.25rem' }}>
              {NUMERALS[i]}
            </span>
            <p style={{ fontFamily: "'IM Fell DW Pica SC', Georgia, serif", fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.6 }}>
              {rule}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={() => { playClick(); onBegin(); }}
        className="btn-ghost"
      >
        Begin the rite
      </button>

    </div>
  );
}
