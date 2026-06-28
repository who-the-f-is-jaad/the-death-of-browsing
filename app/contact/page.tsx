import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact — THE DEATH OF BROWSING',
};

export default function ContactPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.25rem 6rem', display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* Back */}
      <Link
        href="/"
        className="font-heading"
        style={{ fontSize: '0.48rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)', textDecoration: 'none', display: 'block', marginBottom: '3rem' }}
      >
        ← The Death of Browsing
      </Link>

      <article style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        <p className="font-heading" style={{ fontSize: '0.48rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          A word.
        </p>

        <p style={{ fontSize: '3rem', fontStyle: 'italic', color: '#ffffff', lineHeight: 1.2 }}>
          Something to say?
        </p>

        <p style={{ fontSize: '3rem', color: '#ffffff', lineHeight: 1.2, fontWeight: 400 }}>
          A wrong answer. A missing record. A song you think should be in the omen. A bug that broke the ritual. A thought you had while guessing.
        </p>

        <p style={{ fontSize: '3rem', color: '#ffffff', lineHeight: 1.2, fontWeight: 400 }}>
          All of it is welcome.
        </p>

        <div style={{ borderTop: '1px solid var(--border)' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Find me here
          </p>
          <a
            href="https://who-the-f-is-jaad.github.io/jaad/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '3rem', color: '#ffffff', textDecoration: 'underline', textUnderlineOffset: '6px', lineHeight: 1.2 }}
          >
            who-the-f-is-jaad
          </a>
        </div>

        <div style={{ borderTop: '1px solid var(--border)' }} />

        <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>
          No support queue. No ticket system. Just a person.
        </p>

        <p className="font-heading" style={{ fontSize: '0.45rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Contact · 2026
        </p>

      </article>
    </div>
  );
}
