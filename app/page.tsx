'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentDayKey, getNextResetTimestamp } from '@/lib/resetTime';
import { fetchOmenSheet, selectOmenRow } from '@/lib/omenSheet';
import { enrichFromDeezer } from '@/lib/omenDeezer';
import { loadOmenState, saveOmenState, initOmenState } from '@/lib/omenStorage';
import { loadStreak, saveStreak } from '@/lib/localState';
import { updateStreakOnSolve, isStreakAlive } from '@/lib/streaks';
import type { AudioOmenEntry, OmenLocalState } from '@/lib/omenTypes';
import type { StreakData } from '@/lib/types';

import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import ObituaryHeader from '@/components/ui/ObituaryHeader';
import SealedEntry from '@/components/daily/SealedEntry';
import OmenCard from '@/components/daily/OmenCard';
import SoftLockPanel from '@/components/daily/SoftLockPanel';
import UnlockSequence from '@/components/daily/UnlockSequence';
import AlbumReveal from '@/components/daily/AlbumReveal';
import StreakDisplay from '@/components/daily/StreakDisplay';
import Countdown from '@/components/daily/Countdown';

type LoadState = 'summoning' | 'ready' | 'no_entry' | 'no_preview' | 'error';

export default function HomePage() {
  const [loadState, setLoadState] = useState<LoadState>('summoning');
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [entry, setEntry] = useState<AudioOmenEntry | null>(null);
  const [omenState, setOmenState] = useState<OmenLocalState | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    const key = getCurrentDayKey();
    setDayKey(key);

    async function load() {
      try {
        const rows = await fetchOmenSheet();
        const row = selectOmenRow(rows, key);
        if (!row) {
          setLoadState('no_entry');
          setMounted(true);
          return;
        }

        const enriched = await enrichFromDeezer(row.deezerTrackUrl, row.answerYear, key);
        if (!enriched) {
          setLoadState('no_entry');
          setMounted(true);
          return;
        }

        if (!enriched.audioOmen.audioUrl) {
          setLoadState('no_preview');
          setEntry(enriched);
          setMounted(true);
          return;
        }

        const saved = loadOmenState(enriched.id);

        // Expire soft lock if past time
        if (saved.lockedUntil && new Date(saved.lockedUntil) <= new Date()) {
          const reset: OmenLocalState = {
            ...saved,
            attemptsSpent: 0,
            lockedUntil: undefined,
            currentAttemptHeard: false,
          };
          saveOmenState(reset);
          setOmenState(reset);
        } else {
          setOmenState(saved);
        }

        setEntry(enriched);
        setStreak(loadStreak());
        setLoadState('ready');
      } catch {
        setLoadState('error');
      }
      setMounted(true);
    }

    load();
  }, []);

  const persistOmen = useCallback((next: OmenLocalState) => {
    setOmenState(next);
    saveOmenState(next);
  }, []);

  const handleOpen = useCallback(() => {
    if (!omenState) return;
    persistOmen({ ...omenState, opened: true });
  }, [omenState, persistOmen]);

  const handleMarkSpent = useCallback((updated: OmenLocalState) => {
    persistOmen(updated);
  }, [persistOmen]);

  const handleGuessSubmit = useCallback((
    _year: number,
    updated: OmenLocalState,
    correct: boolean,
  ) => {
    persistOmen(updated);
    if (correct) {
      setUnlocking(true);
      const base = streak ?? { current: 0, longest: 0, lastSolvedDate: null };
      const updatedStreak = updateStreakOnSolve(base, dayKey!);
      setStreak(updatedStreak);
      saveStreak(updatedStreak);
    }
  }, [persistOmen, streak, dayKey]);

  const handleUnlockComplete = useCallback(() => {
    setUnlocking(false);
  }, []);

  const handleRetry = useCallback(() => {
    if (!omenState) return;
    persistOmen({
      ...omenState,
      attemptsSpent: 0,
      lockedUntil: undefined,
      currentAttemptHeard: false,
    });
  }, [omenState, persistOmen]);

  const handleReset = useCallback(() => {
    if (!entry) return;
    const fresh = initOmenState(entry.id);
    persistOmen(fresh);
  }, [entry, persistOmen]);

  if (!mounted) {
    return (
      <DeadBrowserShell>
        <div className="flex-1 flex items-center justify-center py-24">
          <p className="font-heading text-xs tracking-widest uppercase animate-pulse-gold" style={{ color: 'var(--text-dim)' }}>
            Summoning the Omen
          </p>
        </div>
      </DeadBrowserShell>
    );
  }

  if (loadState === 'error') {
    return (
      <DeadBrowserShell>
        <div className="flex-1 flex items-center justify-center text-center py-24">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text)' }}>The Dawn Failed to Arrive</p>
            <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-mid)' }}>No omen was found for this day.</p>
          </div>
        </div>
      </DeadBrowserShell>
    );
  }

  if (loadState === 'no_entry') {
    return (
      <DeadBrowserShell>
        <div className="flex-1 flex items-center justify-center text-center py-24">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text)' }}>The Dawn Failed to Arrive</p>
            <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-mid)' }}>No omen was found for this day.</p>
          </div>
        </div>
      </DeadBrowserShell>
    );
  }

  if (loadState === 'no_preview') {
    return (
      <DeadBrowserShell>
        <div className="flex-1 flex items-center justify-center text-center py-24">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text)' }}>The Omen Has No Voice</p>
            <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-mid)' }}>The signal is missing from the record. Return at dawn.</p>
          </div>
        </div>
      </DeadBrowserShell>
    );
  }

  if (!entry || !omenState) return null;

  const isLocked = !!omenState.lockedUntil && new Date(omenState.lockedUntil) > new Date();
  const isSolved = omenState.solved;
  const isOpen = omenState.opened;

  const streakAlive = streak ? isStreakAlive(streak, dayKey!) : false;
  const streakNode = streak && streak.current > 0 && streakAlive
    ? <StreakDisplay streak={streak} />
    : undefined;

  // Compute a fake entry number from date for the header
  const entryNumber = entry.entryNumber ?? 1;

  return (
    <DeadBrowserShell>
      <ObituaryHeader
        entryNumber={entryNumber}
        entryDate={entry.dateUtc}
        streakNode={streakNode}
      />

      <div className="flex-1 flex flex-col gap-6 pb-8">
        {!isOpen && !isSolved && (
          <SealedEntry onOpenRiddle={handleOpen} />
        )}

        {isOpen && !isSolved && !isLocked && !unlocking && (
          <OmenCard
            entry={entry}
            omenState={omenState}
            onMarkSpent={handleMarkSpent}
            onGuessSubmit={handleGuessSubmit}
          />
        )}

        {isLocked && omenState.lockedUntil && (
          <SoftLockPanel
            expiresAt={new Date(omenState.lockedUntil).getTime()}
            onRetry={handleRetry}
            scars={omenState.guesses}
          />
        )}

        {unlocking && <UnlockSequence onComplete={handleUnlockComplete} />}

        {isSolved && !unlocking && (
          <AlbumReveal entry={entry} omenState={omenState} />
        )}
      </div>

      {/* Stats line */}
      <div style={{ textAlign: 'center', paddingBottom: '0.75rem', display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
        {/* Stats will be static until server-side tracking exists */}
      </div>

      {/* Footer */}
      <footer>
        {isSolved && !unlocking && (
          <div className="flex justify-center pb-2 pt-4">
            <button onClick={handleReset} className="btn-text">begin again</button>
          </div>
        )}
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
          <Countdown
            targetTimestamp={getNextResetTimestamp()}
            className="countdown"
          />
          <p className="font-heading" style={{ fontSize: '0.45rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
            07:00 UTC
          </p>
        </div>
      </footer>
    </DeadBrowserShell>
  );
}
