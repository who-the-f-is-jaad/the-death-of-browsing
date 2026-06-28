import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact — THE DEATH OF BROWSING',
};

export default function ContactPage() {
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

      <article style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

        <p className="font-heading" style={{ fontSize: '0.48rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          A word.
        </p>

        <p style={{ fontSize: '1.35rem', fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.5 }}>
          Something to say?
        </p>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.8 }}>
          A wrong answer. A missing record. A song you think should be in the omen. A bug that broke the ritual. A thought you had while guessing.
        </p>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.8 }}>
          All of it is welcome.
        </p>

        <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <p className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Write to
          </p>
          <a
            href="mailto:jad.benyahia@gmail.com"
            style={{ fontSize: '1.05rem', color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: '4px' }}
          >
            jad.benyahia@gmail.com
          </a>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.7 }}>
          No support queue. No ticket system. Just an inbox.
        </p>

        <p className="font-heading" style={{ fontSize: '0.45rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
          Contact · 2026
        </p>

      </article>
    </div>
  );
}
