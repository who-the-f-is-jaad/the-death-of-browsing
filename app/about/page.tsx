import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The Story of Browsing — THE DEATH OF BROWSING',
};

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.25rem 6rem', display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* Back */}
      <Link
        href="/"
        className="font-heading"
        style={{ fontSize: '0.76rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none', display: 'block', marginBottom: '3rem' }}
      >
        ← The Death of Browsing
      </Link>

      <article style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        <p className="font-heading" style={{ fontSize: '0.76rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          The Story of Browsing.
        </p>

        <p style={{ fontSize: '1rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
          The following is a brief account of a sheep who possessed excellent taste in music, but absolutely no concept of time.
        </p>

        <p style={{ fontSize: '3rem', color: '#ffffff', lineHeight: 1.2, fontWeight: 400 }}>
          Browsing lived on an island of grey stone, surrounded by a sea of black ink. Her routine was precise: wake at 6:14, chew three pounds of mountain grass, stare all afternoon at a rusty gramophone on a pedestal of obsidian.
        </p>

        <p style={{ fontSize: '3rem', color: '#ffffff', lineHeight: 1.2, fontWeight: 400 }}>
          Every day, when the wind came from the north, the gramophone would spin. And its music carried across the desolate land, all the way up to the sky.
        </p>

        <p style={{ fontSize: '3rem', fontStyle: 'italic', color: '#ffffff', lineHeight: 1.2 }}>
          Browsing hoped, more than anything, that whoever was listening up there knew the difference between the synth-pop of 1983 and the synth-pop of 1984.
        </p>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: '1rem' }} />

        <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>
          A side project by{' '}
          <a
            href="https://who-the-f-is-jaad.github.io/jaad/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            Jaad
          </a>
          . Built because the feed needed to die.
        </p>

        <p className="font-heading" style={{ fontSize: '0.74rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          The Story of Browsing · 2026
        </p>

      </article>
    </div>
  );
}
