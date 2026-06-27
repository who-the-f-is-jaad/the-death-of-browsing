import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About — THE DEATH OF BROWSING',
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1.25rem 4rem', display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* Back */}
      <Link
        href="/"
        className="font-heading"
        style={{ fontSize: '0.48rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none', display: 'block', marginBottom: '2.5rem' }}
      >
        ← The Death of Browsing
      </Link>

      {/* Manifesto */}
      <article style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

        <p className="font-heading" style={{ fontSize: '0.48rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          A manifesto.
        </p>

        <p style={{ fontSize: '1.35rem', fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.5 }}>
          There is too much music now.
        </p>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.8 }}>
          Not too much good music. Just too much everything, all at once. Tabs, playlists, recommendations, releases, snippets, charts, links from friends, songs you saved and never played again.
        </p>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.8 }}>
          At some point, listening started to feel like browsing.
        </p>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.8 }}>
          The Death of Browsing is a small attempt to slow that down.
        </p>

        {/* Rule */}
        <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

        <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.8 }}>
          Every day, you get one piece of music. No feed. No infinite scroll. No perfect recommendation engine pretending to know you. Just a short sound, a record, and one question:
        </p>

        <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.5, paddingLeft: '1rem', borderLeft: '2px solid var(--border-hi)' }}>
          What year is this from?
        </p>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.8 }}>
          Maybe you know it instantly. Maybe you are off by a decade. Maybe you discover something you should have heard years ago.
        </p>

        <p style={{ fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.8 }}>
          That is the point.
        </p>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.8 }}>
          It is a daily ritual for people who still believe records have a time, a place, a smell, a sleeve, a story. For people who miss getting lost in music, not just moving through it.
        </p>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.8 }}>
          One record a day. One guess. One reason to listen a little closer.
        </p>

        <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

        <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.5 }}>
          The browser is dead.
        </p>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.8 }}>
          See you tomorrow.
        </p>

        {/* How it works */}
        <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

        <p className="font-heading" style={{ fontSize: '0.48rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          How it works.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <p className="font-heading" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '0.3rem' }}>
              Daily game
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
              One track, shared globally. Three attempts to guess the release year. The omen resets every day at 07:00 UTC.
            </p>
          </div>
          <div>
            <p className="font-heading" style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '0.3rem' }}>
              Deathmatch
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
              Create a private room. Share the link. Everyone hears the same records — whoever guesses closest wins the round. Up to 10 players, 3 to 10 rounds.
            </p>
          </div>
        </div>

        {/* Credit */}
        <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>
          A side project by{' '}
          <a
            href="https://who-the-f-is-jaad.github.io/jaad/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-mid)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            Jaad
          </a>
          . Built because the feed needed to die.
        </p>

        <p className="font-heading" style={{ fontSize: '0.45rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
          Manifesto · 2026
        </p>

      </article>
    </div>
  );
}
