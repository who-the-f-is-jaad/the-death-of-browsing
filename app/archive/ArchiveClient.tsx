'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchOmenSheet } from '@/lib/omenSheet';
import { enrichFromDeezer } from '@/lib/omenDeezer';
import { getCurrentDayKey } from '@/lib/resetTime';
import DeadBrowserShell from '@/components/ui/DeadBrowserShell';

interface ArchiveItem {
  date: string;
  year: number;
  albumTitle?: string;
  artist?: string;
  loaded: boolean;
}

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default function ArchiveClient() {
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    async function load() {
      try {
        const rows = await fetchOmenSheet();
        const today = getCurrentDayKey();
        const past = rows
          .filter(r => r.date <= today)
          .sort((a, b) => b.date.localeCompare(a.date));

        // Show year + date immediately; album info fills in as Deezer responds
        setItems(past.map(r => ({ date: r.date, year: r.answerYear, loaded: false })));
        setStatus('ready');

        for (const row of past) {
          enrichFromDeezer(row.deezerTrackUrl, row.answerYear, row.date)
            .then(entry => {
              if (!entry) return;
              setItems(prev => prev.map(item =>
                item.date === row.date
                  ? { ...item, albumTitle: entry.album.title, artist: entry.album.artist, loaded: true }
                  : item
              ));
            })
            .catch(() => {
              setItems(prev => prev.map(item =>
                item.date === row.date ? { ...item, loaded: true } : item
              ));
            });
        }
      } catch {
        setStatus('error');
      }
    }
    load();
  }, []);

  return (
    <DeadBrowserShell>
      <header className="cat-header">
        <Link href="/" className="cat-brand" style={{ textDecoration: 'none' }}>
          The Death of Browsing
        </Link>
        <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.4, marginTop: '0.35rem' }}>
          Past omens
        </p>
      </header>

      {status === 'loading' && (
        <div style={{ padding: '3rem 0', textAlign: 'center' }}>
          <p className="font-heading animate-pulse-gold" style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Loading...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div style={{ padding: '3rem 0', textAlign: 'center' }}>
          <p style={{ fontStyle: 'italic', color: 'var(--text-mid)' }}>Could not load the archive.</p>
        </div>
      )}

      {status === 'ready' && items.length === 0 && (
        <div style={{ padding: '3rem 0', textAlign: 'center' }}>
          <p style={{ fontStyle: 'italic', color: 'var(--text-mid)' }}>No records yet.</p>
        </div>
      )}

      {status === 'ready' && items.length > 0 && (
        <div style={{ paddingBottom: '3rem' }}>
          {items.map(item => (
            <div
              key={item.date}
              style={{
                display: 'grid',
                gridTemplateColumns: '3.5rem 1fr',
                gap: '0 1rem',
                padding: '1.1rem 0',
                borderBottom: '1px solid var(--border)',
                alignItems: 'start',
              }}
            >
              {/* Release year — the answer */}
              <p
                className="font-heading"
                style={{
                  fontSize: '1.5rem',
                  color: 'var(--text)',
                  lineHeight: 1,
                  paddingTop: '0.1rem',
                }}
              >
                {item.year}
              </p>

              {/* Album + artist + date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.3 }}>
                  {item.loaded ? (item.albumTitle ?? '—') : '—'}
                </p>
                {item.loaded && item.artist && (
                  <p style={{ fontStyle: 'italic', fontSize: '0.78rem', color: 'var(--text-mid)' }}>
                    {item.artist}
                  </p>
                )}
                <p
                  className="font-heading"
                  style={{ fontSize: '0.46rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.2rem' }}
                >
                  {formatDate(item.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DeadBrowserShell>
  );
}
