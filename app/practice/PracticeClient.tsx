'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentDayKey, getPreviousDayKey } from '@/lib/resetTime';
import { fetchOmenSheet, selectOmenRow } from '@/lib/omenSheet';
import { enrichFromDeezer } from '@/lib/omenDeezer';
import type { AudioOmenEntry, OmenLocalState } from '@/lib/omenTypes';

import Link from 'next/link';
import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import OmenCard from '@/components/daily/OmenCard';
import AlbumReveal from '@/components/daily/AlbumReveal';

type LoadState = 'summoning' | 'ready' | 'no_entry' | 'error';

function initPracticeState(entryId: string): OmenLocalState {
  return {
    entryId,
    opened: true,
    solved: false,
    attemptsSpent: 0,
    guesses: [],
    currentAttemptHeard: false,
  };
}

export default function PracticeClient() {
  const [loadState, setLoadState] = useState<LoadState>('summoning');
  const [entry, setEntry] = useState<AudioOmenEntry | null>(null);
  const [practiceState, setPracticeState] = useState<OmenLocalState | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const yesterdayKey = getPreviousDayKey(getCurrentDayKey());

    async function load() {
      try {
        const rows = await fetchOmenSheet();
        const row = selectOmenRow(rows, yesterdayKey);
        if (!row) {
          setLoadState('no_entry');
          return;
        }

        const enriched = await enrichFromDeezer(row.deezerTrackUrl, row.answerYear, yesterdayKey);
        if (!enriched) {
          setLoadState('no_entry');
          return;
        }

        setEntry(enriched);
        setPracticeState(initPracticeState(enriched.id));
        setLoadState('ready');
      } catch {
        setLoadState('error');
      }
    }

    load();
  }, []);

  const handleMarkSpent = useCallback((updated: OmenLocalState) => {
    setPracticeState(updated);
  }, []);

  const handleGuessSubmit = useCallback((
    _year: number,
    updated: OmenLocalState,
    correct: boolean,
  ) => {
    const noLock = { ...updated, lockedUntil: undefined };
    setPracticeState(noLock);
    if (correct || noLock.guesses.length >= 3) {
      setRevealed(true);
    }
  }, []);

  if (loadState === 'summoning') {
    return (
      <DeadBrowserShell>
        <div className="flex-1 flex items-center justify-center py-24">
          <p className="font-heading animate-pulse-gold" style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Summoning yesterday&apos;s omen
          </p>
        </div>
      </DeadBrowserShell>
    );
  }

  if (loadState === 'error' || loadState === 'no_entry') {
    return (
      <DeadBrowserShell>
        <div className="flex-1 flex items-center justify-center text-center py-24">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text)' }}>
              No Corpse Found
            </p>
            <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-mid)' }}>
              Yesterday&apos;s omen has not been recorded. Return after the next dawn.
            </p>
            <a href="/" className="font-heading" style={{ fontSize: '0.52rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '1rem' }}>
              Back to today
            </a>
          </div>
        </div>
      </DeadBrowserShell>
    );
  }

  if (!entry || !practiceState) return null;

  return (
    <DeadBrowserShell>
      <header className="cat-header">
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <Link href="/" className="cat-brand" style={{ textDecoration: 'none' }}>
            The Death of Browsing
          </Link>
          <span className="font-heading" style={{ fontSize: '0.5rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Practice
          </span>
        </div>
        <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.4, marginTop: '0.35rem' }}>
          Yesterday&apos;s corpse — {entry.dateUtc}
        </p>
      </header>

      <div className="flex-1 flex flex-col gap-6 pb-8">

        {!revealed ? (
          <OmenCard
            entry={entry}
            omenState={practiceState}
            onMarkSpent={handleMarkSpent}
            onGuessSubmit={handleGuessSubmit}
            practiceMode
          />
        ) : (
          <AlbumReveal
            entry={entry}
            omenState={practiceState}
            practiceMode
          />
        )}

      </div>
    </DeadBrowserShell>
  );
}
