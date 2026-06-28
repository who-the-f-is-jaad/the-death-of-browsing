'use client';

import { useState, useEffect, useCallback } from 'react';
import { track } from '@vercel/analytics';
import { getCurrentDayKey, getNextResetTimestamp } from '@/lib/resetTime';
import { loadOmenState, saveOmenState, initOmenState } from '@/lib/omenStorage';
import { loadStreak, saveStreak } from '@/lib/localState';
import { updateStreakOnSolve, isStreakAlive } from '@/lib/streaks';
import { setPendingOmenAudio, markPendingOmenAudioFailed } from '@/lib/omenAudio';
import type { AudioOmenEntry, OmenLocalState } from '@/lib/omenTypes';
import type { StreakData } from '@/lib/types';

import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import RulesGate from '@/components/daily/RulesGate';
import ObituaryHeader from '@/components/ui/ObituaryHeader';
import IntroScreen from '@/components/daily/IntroScreen';
import SealedEntry from '@/components/daily/SealedEntry';
import OmenCard from '@/components/daily/OmenCard';
import SoftLockPanel from '@/components/daily/SoftLockPanel';
import UnlockSequence from '@/components/daily/UnlockSequence';
import AlbumReveal from '@/components/daily/AlbumReveal';
import StreakDisplay from '@/components/daily/StreakDisplay';
import Countdown from '@/components/daily/Countdown';

type LoadState = 'summoning' | 'ready' | 'no_entry' | 'no_preview' | 'error';

export default function HomePage() {
  const [introComplete, setIntroComplete] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>('summoning');
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [entry, setEntry] = useState<AudioOmenEntry | null>(null);
  const [omenState, setOmenState] = useState<OmenLocalState | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [showingRules, setShowingRules] = useState(false);
  const [dailyStats, setDailyStats] = useState<{ plays: number; solves: number } | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('tdb:intro-seen') === '1') {
      setIntroComplete(true);
    }
  }, []);

  useEffect(() => {
    const key = getCurrentDayKey();
    setDayKey(key);

    async function load() {
      try {
        const res = await fetch('/api/daily');
        if (!res.ok) throw new Error('daily fetch failed');
        const data: { entry: AudioOmenEntry | null; reason?: string } = await res.json();

        if (!data.entry) {
          setLoadState('no_entry');
          setMounted(true);
          return;
        }

        if (data.reason === 'no_preview') {
          setLoadState('no_preview');
          setEntry(data.entry);
          setMounted(true);
          return;
        }

        const enriched = data.entry;
        const saved = loadOmenState(enriched.id);

        // Logo-click navigation from other pages sets this flag to force menu view
        if (sessionStorage.getItem('tdb:go-menu') === '1') {
          sessionStorage.removeItem('tdb:go-menu');
          saved.opened = false;
          saveOmenState(saved);
        }

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

        // Load today's stats (non-critical — failures are silent)
        fetch(`/api/stats?date=${key}`)
          .then(r => r.ok ? r.json() : null)
          .then(data => { if (data) setDailyStats(data); })
          .catch(() => {});
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
    if (!omenState || !entry) return;

    const url = entry.audioOmen.audioUrl;
    const isFirstPlay = omenState.attemptsSpent === 0;

    // Start audio inside the click handler to satisfy mobile autoplay policy.
    if (url && isFirstPlay) {
      const audio = new Audio(url);
      // Register BEFORE play() so the error listener is attached first.
      setPendingOmenAudio(audio);
      // Capture play() rejections (e.g. NotAllowedError) separately from media 'error' events.
      audio.play().catch(() => { markPendingOmenAudioFailed(); });
    }

    // Count the first play of the day (deduplicated via localStorage)
    if (isFirstPlay && dayKey) {
      const countedKey = `tdb:counted-play:${dayKey}`;
      if (!localStorage.getItem(countedKey)) {
        localStorage.setItem(countedKey, '1');
        fetch('/api/stats/play', { method: 'POST' }).catch(() => {});
      }
      track('play_started');
    }

    persistOmen({
      ...omenState,
      opened: true,
      ...(url && isFirstPlay ? { attemptsSpent: 1, currentAttemptHeard: true } : {}),
    });
  }, [omenState, entry, persistOmen]);

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
      // The cover flip in OmenCard is the reveal animation — skip UnlockSequence.
      const base = streak ?? { current: 0, longest: 0, lastSolvedDate: null };
      const updatedStreak = updateStreakOnSolve(base, dayKey!);
      setStreak(updatedStreak);
      saveStreak(updatedStreak);

      // Count the solve (deduplicated via localStorage)
      if (dayKey) {
        const countedKey = `tdb:counted-solve:${dayKey}`;
        if (!localStorage.getItem(countedKey)) {
          localStorage.setItem(countedKey, '1');
          fetch('/api/stats/solve', { method: 'POST' }).catch(() => {});
        }
      }
      track('game_solved', { attempts: updated.guesses.length });
      // Record result for logged-in users (server ignores if not authed)
      if (dayKey) {
        fetch('/api/user/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dayKey, solved: true, attempts: updated.guesses.length }),
        }).catch(() => {});
      }
    } else if (updated.guesses.length >= 3 && updated.lockedUntil) {
      track('game_failed');
      if (dayKey) {
        fetch('/api/user/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dayKey, solved: false, attempts: updated.guesses.length }),
        }).catch(() => {});
      }
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

  if (!introComplete) {
    return <IntroScreen onComplete={() => setIntroComplete(true)} />;
  }

  if (!mounted) {
    return (
      <DeadBrowserShell>
        <div className="flex-1 flex items-center justify-center py-24">
          <p className="font-heading animate-pulse-gold" style={{ fontSize: '0.9rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
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
        onLogoClick={isOpen
          ? () => persistOmen({ ...omenState, opened: false })
          : undefined}
      />

      <div className="flex-1 flex flex-col gap-6 pb-8">
        {!isOpen && !showingRules && (
          <SealedEntry
            onOpenRiddle={omenState.guesses.length === 0
              ? () => setShowingRules(true)
              : handleOpen}
            plays={dailyStats?.plays}
            solves={dailyStats?.solves}
            hasFailed={omenState.guesses.length >= 3 && !isSolved}
            hasNotPlayed={omenState.guesses.length === 0}
            hasSolved={isSolved}
          />
        )}

        {!isOpen && showingRules && (
          <RulesGate onBegin={() => { setShowingRules(false); handleOpen(); }} />
        )}

        {isOpen && !isSolved && !isLocked && !unlocking && (
          <OmenCard
            entry={entry}
            omenState={omenState}
            onMarkSpent={handleMarkSpent}
            onGuessSubmit={handleGuessSubmit}
          />
        )}

        {isOpen && isLocked && omenState.lockedUntil && (
          <SoftLockPanel
            expiresAt={new Date(omenState.lockedUntil).getTime()}
            onRetry={handleRetry}
            scars={omenState.guesses}
            date={entry.dateUtc}
          />
        )}

        {unlocking && <UnlockSequence onComplete={handleUnlockComplete} />}

        {isOpen && isSolved && !unlocking && (
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
            { label: 'Profile', href: '/profile' },
            { label: 'About', href: '/about' },
            { label: 'Contact', href: '/contact' },
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
        <div style={{ textAlign: 'center', paddingBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <p className="font-heading" style={{ fontSize: '0.74rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Next record in
          </p>
          <Countdown
            targetTimestamp={getNextResetTimestamp()}
            className="countdown"
          />
          <p className="font-heading" style={{ fontSize: '0.74rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Every day at 07:00 UTC
          </p>
        </div>
      </footer>
    </DeadBrowserShell>
  );
}
