'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { track } from '@vercel/analytics';
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
  const [playedIds, setPlayedIds] = useState<string[]>([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [exhausted, setExhausted] = useState(false);

  // Use a ref so loadSong always sees the latest playedIds without stale closure
  const playedIdsRef = useRef<string[]>([]);
  playedIdsRef.current = playedIds;

  const loadSong = useCallback(async (exclude: string[]) => {
    setLoadState('summoning');
    setRevealed(false);
    setExhausted(false);
    try {
      const qs = exclude.length ? `?exclude=${exclude.join(',')}` : '';
      const res = await fetch(`/api/practice${qs}`);
      if (!res.ok) throw new Error('fetch failed');
      const data: { entry: AudioOmenEntry | null; trackId?: string; exhausted?: boolean } = await res.json();

      if (data.exhausted) {
        setExhausted(true);
        setLoadState('ready');
        return;
      }
      if (!data.entry) {
        setLoadState('no_entry');
        return;
      }

      setEntry(data.entry);
      setPracticeState(initPracticeState(data.entry.id));
      setLoadState('ready');
      if (data.trackId) {
        setPlayedIds(prev => [...prev, data.trackId!]);
      }
      track('practice_started');
    } catch {
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    loadSong([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = useCallback(() => {
    loadSong(playedIdsRef.current);
  }, [loadSong]);

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
      setScore(prev => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }));
      track(correct ? 'practice_solved' : 'practice_failed', { attempts: noLock.guesses.length });
    }
  }, []);

  if (loadState === 'summoning') {
    return (
      <DeadBrowserShell>
        <div className="flex-1 flex items-center justify-center py-24">
          <p className="font-heading animate-pulse-gold" style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Summoning a record…
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
            <p className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text)' }}>
              No Corpse Found
            </p>
            <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-mid)' }}>
              The pool could not be reached. Try again.
            </p>
            <button onClick={() => loadSong([])} className="btn-ghost" style={{ marginTop: '1rem' }}>
              Try again
            </button>
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
            <p className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text)' }}>
              No Corpse Found
            </p>
            <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-mid)' }}>
              The pool appears empty. Return after the next dawn.
            </p>
            <a href="/" className="font-heading" style={{ fontSize: '0.52rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '1rem' }}>
              Back to today
            </a>
          </div>
        </div>
      </DeadBrowserShell>
    );
  }

  const scoreLabel = score.total > 0 ? `${score.correct} / ${score.total} correct` : 'Pick a year';

  if (exhausted) {
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
            {scoreLabel}
          </p>
        </header>
        <div className="flex-1 flex items-center justify-center text-center py-24">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text)' }}>
              You&apos;ve heard them all.
            </p>
            <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-mid)' }}>
              Final score: {score.correct} / {score.total}
            </p>
            <button
              onClick={() => { setPlayedIds([]); setScore({ correct: 0, total: 0 }); loadSong([]); }}
              className="btn-ghost"
              style={{ marginTop: '0.5rem' }}
            >
              Start over
            </button>
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
          {scoreLabel}
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
            onNext={handleNext}
          />
        )}
      </div>
    </DeadBrowserShell>
  );
}
