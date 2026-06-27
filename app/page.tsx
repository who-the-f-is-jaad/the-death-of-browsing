'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentDayKey } from '@/lib/resetTime';
import { getMockEntryForDate } from '@/lib/mockEntries';
import { loadOrInitProgress, saveProgress, loadStreak, saveStreak, removeProgress, initProgress } from '@/lib/localState';
import { checkAnswer, normalizeAnswer } from '@/lib/answerNormalization';
import {
  getEffectiveState,
  applyOpenRiddle,
  applyWrongAnswer,
  applyCorrectAnswer,
  applyUnlockComplete,
  applyRetryAfterSoftLock,
  getErrorMessageIndex,
} from '@/lib/dailyStateMachine';
import { updateStreakOnSolve, isStreakAlive } from '@/lib/streaks';
import { COPY } from '@/lib/copy';
import type { DailyEntry, DailyProgress, StreakData } from '@/lib/types';

import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import ObituaryHeader from '@/components/ui/ObituaryHeader';
import SealedEntry from '@/components/daily/SealedEntry';
import RiddleCard from '@/components/daily/RiddleCard';
import SoftLockPanel from '@/components/daily/SoftLockPanel';
import UnlockSequence from '@/components/daily/UnlockSequence';
import AlbumReveal from '@/components/daily/AlbumReveal';
import StreakDisplay from '@/components/daily/StreakDisplay';

export default function HomePage() {
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [progress, setProgress] = useState<DailyProgress | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const key = getCurrentDayKey();
    setDayKey(key);
    setEntry(getMockEntryForDate(key));

    let saved = loadOrInitProgress(key);

    if (
      saved.state === 'soft_locked' &&
      saved.softLockExpiresAt !== null &&
      Date.now() >= saved.softLockExpiresAt
    ) {
      saved = applyRetryAfterSoftLock(saved);
      saveProgress(saved);
    }

    setProgress(saved);
    setStreak(loadStreak());
    setMounted(true);
  }, []);

  const persist = useCallback((next: DailyProgress) => {
    setProgress(next);
    saveProgress(next);
  }, []);

  const handleOpenRiddle = useCallback(() => {
    if (!progress) return;
    persist(applyOpenRiddle(progress));
  }, [progress, persist]);

  const handleSubmitAnswer = useCallback(
    (raw: string) => {
      if (!progress || !entry) return;

      if (checkAnswer(raw, entry.acceptedAnswers)) {
        const next = applyCorrectAnswer(progress, normalizeAnswer(raw));
        persist(next);
        const base = streak ?? { current: 0, longest: 0, lastSolvedDate: null };
        const updated = updateStreakOnSolve(base, progress.entryDate);
        setStreak(updated);
        saveStreak(updated);
      } else {
        persist(applyWrongAnswer(progress, normalizeAnswer(raw)));
      }
    },
    [progress, entry, streak, persist],
  );

  const handleUnlockComplete = useCallback(() => {
    if (!progress) return;
    persist(applyUnlockComplete(progress));
  }, [progress, persist]);

  const handleRetry = useCallback(() => {
    if (!progress) return;
    persist(applyRetryAfterSoftLock(progress));
  }, [progress, persist]);

  const handleReset = useCallback(() => {
    if (!dayKey) return;
    removeProgress(dayKey);
    setProgress(initProgress(dayKey));
  }, [dayKey]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <DeadBrowserShell>
        <div className="flex-1 flex items-center justify-center py-24">
          <p
            className="font-heading text-xs tracking-widest uppercase animate-pulse-gold"
            style={{ color: 'var(--text-dim)' }}
          >
            {COPY.loading}
          </p>
        </div>
      </DeadBrowserShell>
    );
  }

  if (!entry || !progress) {
    return (
      <DeadBrowserShell>
        <div className="flex-1 flex items-center justify-center text-center py-24">
          <div className="flex flex-col gap-3">
            <p className="font-heading text-lg" style={{ color: 'var(--text)' }}>
              {COPY.noEntryToday}
            </p>
            <p
              className="font-heading text-xs tracking-widest uppercase"
              style={{ color: 'var(--text-dim)' }}
            >
              {COPY.noEntrySubtext}
            </p>
          </div>
        </div>
      </DeadBrowserShell>
    );
  }

  const effectiveState = getEffectiveState(progress);
  const errorIndex = getErrorMessageIndex(progress.attemptsInCurrentWindow);
  const streakAlive = streak ? isStreakAlive(streak, dayKey!) : false;

  const streakNode =
    streak && streak.current > 0 && streakAlive ? <StreakDisplay streak={streak} /> : undefined;

  return (
    <DeadBrowserShell>
      <ObituaryHeader
        entryNumber={entry.entryNumber}
        entryDate={entry.date}
        streakNode={streakNode}
      />

      {/* ── Daily experience ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-6 pb-8">
        {effectiveState === 'sealed' && (
          <SealedEntry entry={entry} onOpenRiddle={handleOpenRiddle} />
        )}

        {(effectiveState === 'riddle_active' || effectiveState === 'riddle_error') && (
          <RiddleCard
            entry={entry}
            state={effectiveState}
            attemptsInWindow={progress.attemptsInCurrentWindow}
            errorMessageIndex={errorIndex}
            onSubmit={handleSubmitAnswer}
          />
        )}

        {effectiveState === 'soft_locked' && progress.softLockExpiresAt !== null && (
          <SoftLockPanel
            expiresAt={progress.softLockExpiresAt}
            onRetry={handleRetry}
          />
        )}

        {effectiveState === 'unlocking' && (
          <UnlockSequence onComplete={handleUnlockComplete} />
        )}

        {effectiveState === 'unlocked' && (
          <AlbumReveal entry={entry} attempts={progress.attempts} />
        )}
      </div>

      {/* ── Footer nav ───────────────────────────────────────────────────── */}
      <footer>
        {effectiveState === 'unlocked' && (
          <div className="flex justify-center pb-2 pt-4">
            <button onClick={handleReset} className="btn-text">
              begin again
            </button>
          </div>
        )}
        <nav
          className="flex justify-center gap-8 py-4"
          style={{ borderTop: '1px solid var(--border-mid)' }}
          aria-label="Site navigation"
        >
          {[
            { label: COPY.navArchive, href: '/archive' },
            { label: COPY.navAbout,   href: '/about'   },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="font-heading text-xs tracking-widest uppercase transition-colors"
              style={{ color: 'var(--text-dim)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-dim)';
              }}
            >
              {label}
            </a>
          ))}
        </nav>
      </footer>
    </DeadBrowserShell>
  );
}
