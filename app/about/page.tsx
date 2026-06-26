import type { Metadata } from 'next';
import { COPY } from '@/lib/copy';

export const metadata: Metadata = {
  title: `${COPY.aboutTitle} — THE DEATH OF BROWSING`,
};

export default function AboutPage() {
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

      <article className="flex flex-col gap-6">
        <h1
          className="font-heading text-2xl"
          style={{ color: 'var(--text-primary)' }}
        >
          {COPY.aboutTitle}
        </h1>

        <span className="rule-gold" style={{ margin: '0' }} />

        <div className="flex flex-col gap-4">
          {COPY.aboutLines.map((line, i) => (
            <p
              key={i}
              className="font-serif text-base leading-loose"
              style={{
                color:
                  i === COPY.aboutLines.length - 1
                    ? 'var(--gold-dim)'
                    : 'var(--text-secondary)',
                fontStyle: i === COPY.aboutLines.length - 1 ? 'italic' : 'normal',
              }}
            >
              {line}
            </p>
          ))}
        </div>

        <span className="rule-gold" style={{ margin: '0' }} />

        {/* Reset info card */}
        <div className="card p-5 flex flex-col gap-2">
          <p
            className="font-heading text-xs tracking-widest uppercase"
            style={{ color: 'var(--text-dim)', letterSpacing: '0.3em' }}
          >
            Reset schedule
          </p>
          <p
            className="font-heading text-sm leading-relaxed"
            style={{ color: 'var(--text-primary)', letterSpacing: '0.05em' }}
          >
            {COPY.resetMeridian}
          </p>
          <p
            className="font-serif text-xs italic"
            style={{ color: 'var(--text-secondary)' }}
          >
            07:00 UTC daily. Missing a day breaks your streak.
          </p>
        </div>
      </article>

      <footer className="flex justify-center mt-auto">
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
