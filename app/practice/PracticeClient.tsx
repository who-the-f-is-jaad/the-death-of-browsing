'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import DeadBrowserShell from '@/components/ui/DeadBrowserShell';
import SoloRound from '@/components/practice/SoloRound';
import SoloReveal from '@/components/practice/SoloReveal';
import SoloFinished from '@/components/practice/SoloFinished';
import { computeProximityScore } from '@/lib/scoring';
import { pauseAmbient } from '@/lib/ambientAudio';
import type { AudioOmenEntry } from '@/lib/omenTypes';

const TOTAL_ROUNDS = 5;

interface SoloEntry {
  audioUrl: string;
  answerYear: number;
  albumTitle: string;
  artist: string;
  coverImageUrl?: string;
  deezerAlbumUrl: string;
  trackTitle?: string;
}

interface CompletedRound {
  entry: SoloEntry;
  guessedYear: number;
  score: number;
}

type Phase = 'loading' | 'active' | 'reveal' | 'finished' | 'error' | 'exhausted';

function toSoloEntry(e: AudioOmenEntry): SoloEntry {
  return {
    audioUrl: e.audioOmen.audioUrl,
    answerYear: e.audioOmen.answerYear,
    albumTitle: e.album.title,
    artist: e.album.artist,
    coverImageUrl: e.album.coverImageUrl,
    deezerAlbumUrl: e.album.deezerUrl,
    trackTitle: e.track?.title,
  };
}

export default function PracticeClient() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [roundIndex, setRoundIndex] = useState(0);
  const [currentEntry, setCurrentEntry] = useState<SoloEntry | null>(null);
  const [completedRounds, setCompletedRounds] = useState<CompletedRound[]>([]);
  const [lastGuess, setLastGuess] = useState<{ year: number; score: number } | null>(null);
  const [sessionCoins, setSessionCoins] = useState(0);

  const playedIdsRef = useRef<string[]>([]);

  const fetchRound = useCallback(async () => {
    setPhase('loading');
    try {
      const qs = playedIdsRef.current.length ? `?exclude=${playedIdsRef.current.join(',')}` : '';
      const res = await fetch(`/api/practice${qs}`);
      if (!res.ok) throw new Error('fetch failed');
      const data: { entry: AudioOmenEntry | null; trackId?: string; exhausted?: boolean } = await res.json();

      if (data.exhausted || !data.entry) {
        setPhase('exhausted');
        return;
      }

      if (data.trackId) playedIdsRef.current = [...playedIdsRef.current, data.trackId];
      setCurrentEntry(toSoloEntry(data.entry));
      setPhase('active');
    } catch {
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    pauseAmbient();
    fetchRound();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGuess = useCallback((year: number) => {
    if (!currentEntry) return;
    const score = computeProximityScore(year, currentEntry.answerYear);
    const completed: CompletedRound = { entry: currentEntry, guessedYear: year, score };
    setCompletedRounds(prev => [...prev, completed]);
    setLastGuess({ year, score });
    setPhase('reveal');
  }, [currentEntry]);

  const handleNext = useCallback(() => {
    const nextIndex = roundIndex + 1;
    if (nextIndex >= TOTAL_ROUNDS) {
      const total = completedRounds.reduce((s, r) => s + r.score, 0);
      setSessionCoins(Math.floor(total / 1000) / 10);
      fetch('/api/practice/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: total,
          rounds: completedRounds.map(r => ({ answerYear: r.entry.answerYear, score: r.score })),
        }),
      }).catch(() => {});
      setPhase('finished');
    } else {
      setRoundIndex(nextIndex);
      setCurrentEntry(null);
      setLastGuess(null);
      fetchRound();
    }
  }, [roundIndex, completedRounds, fetchRound]);

  const handlePlayAgain = useCallback(() => {
    playedIdsRef.current = [];
    setRoundIndex(0);
    setCompletedRounds([]);
    setLastGuess(null);
    setCurrentEntry(null);
    fetchRound();
  }, [fetchRound]);

  const header = (
    <header className="cat-header">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Link href="/" className="cat-brand" style={{ textDecoration: 'none' }}>
          The Death of Browsing
        </Link>
        <span className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Solo Play
        </span>
      </div>
    </header>
  );

  if (phase === 'loading') {
    return (
      <DeadBrowserShell>
        {header}
        <div className="flex-1 flex items-center justify-center py-24">
          <p className="font-heading animate-pulse-gold" style={{ fontSize: '0.9rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Summoning a record…
          </p>
        </div>
      </DeadBrowserShell>
    );
  }

  if (phase === 'error') {
    return (
      <DeadBrowserShell>
        {header}
        <div className="flex-1 flex items-center justify-center text-center py-24">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text)' }}>
              No Corpse Found
            </p>
            <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-mid)' }}>
              The pool could not be reached. Try again.
            </p>
            <button onClick={fetchRound} className="btn-ghost" style={{ marginTop: '1rem' }}>
              Try again
            </button>
          </div>
        </div>
      </DeadBrowserShell>
    );
  }

  if (phase === 'exhausted') {
    return (
      <DeadBrowserShell>
        {header}
        <div className="flex-1 flex items-center justify-center text-center py-24">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p className="font-heading" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text)' }}>
              You&apos;ve heard them all.
            </p>
            <p style={{ fontStyle: 'italic', fontSize: '0.875rem', color: 'var(--text-mid)' }}>
              No new records left in the pool.
            </p>
            <button
              onClick={() => { playedIdsRef.current = []; setRoundIndex(0); setCompletedRounds([]); fetchRound(); }}
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

  if (phase === 'finished') {
    return (
      <DeadBrowserShell>
        {header}
        <div className="flex-1 flex flex-col gap-6 pb-8">
          <SoloFinished rounds={completedRounds} onPlayAgain={handlePlayAgain} coinsEarned={sessionCoins} />
        </div>
      </DeadBrowserShell>
    );
  }

  if (!currentEntry || !lastGuess && phase === 'reveal') return null;

  return (
    <DeadBrowserShell>
      {header}
      <div className="flex-1 flex flex-col gap-6 pb-8">
        {phase === 'active' && currentEntry && (
          <SoloRound
            key={roundIndex}
            roundIndex={roundIndex}
            audioUrl={currentEntry.audioUrl}
            onGuess={handleGuess}
          />
        )}
        {phase === 'reveal' && currentEntry && lastGuess && (
          <SoloReveal
            roundIndex={roundIndex}
            entry={currentEntry}
            guessedYear={lastGuess.year}
            score={lastGuess.score}
            isLast={roundIndex === TOTAL_ROUNDS - 1}
            onNext={handleNext}
          />
        )}
      </div>
    </DeadBrowserShell>
  );
}
