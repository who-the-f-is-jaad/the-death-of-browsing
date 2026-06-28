# Dev Notes

Internal notes on quirks, decisions, and things that burned time.

---

## KV namespaces

| Prefix | Purpose |
|---|---|
| `tdb:room:<roomId>` | Multiplayer room state (JSON blob) |
| `tdb:preview:<trackId>` | Cached Deezer preview URL (short TTL) |
| `tdb:auth:<token>` | Magic link token → email mapping |
| `tdb:session:<sessionId>` | Session cookie → user mapping |
| `tdb:stats:daily:<date>:plays` | Daily play counter |
| `tdb:stats:daily:<date>:solves` | Daily solve counter |

---

## Deezer API

- Preview URLs (`track.preview`) are **temporary CDN links** — they expire. Never store them permanently.
- `enrichFromDeezer(deezerTrackUrl, answerYear, mode)` in `lib/omenDeezer.ts` fetches a live preview each time. This is intentional.
- The Deezer proxy routes under `app/api/deezer/` exist to avoid CORS and keep the API calls server-side.
- If Deezer returns no preview for a track, `enrichFromDeezer` returns `null`. The daily route and practice route both handle this gracefully.

---

## Audio

### Ambient audio
- Singleton in `lib/ambientAudio.ts` — one `Audio` object shared across the whole session.
- `playAmbient()` is async (returns a Promise). Always `await` it before reading `isAmbientPlaying()`.
- Browser autoplay is blocked until a user gesture. Never call `playAmbient()` in a `useEffect` without a prior gesture — it will always fail silently. Remove such calls rather than swallowing errors.
- Audio src path must have spaces encoded (`%20`) — bare spaces in paths fail in some environments.

### Click sound
- `playClick()` in `lib/clickSound.ts` — lightweight one-shot, fire-and-forget.

### Omen audio (track preview)
- Started inside `OmenCard` within a user gesture (the Listen button click).
- Passed to `AlbumReveal` via `consumePendingOmenAudio()` from `lib/omenAudio.ts`.
- `AlbumReveal` resumes it in `useEffect` — this works because the audio object was already unlocked by the original gesture.

---

## Daily game state

State is stored in `localStorage` as `tdb:omen:<entryId>` — a JSON blob matching `OmenLocalState` (see `lib/omenTypes.ts`).

Key fields:
- `opened` — whether the player has clicked into the game today
- `solved` — whether the correct year was guessed
- `guesses` — array of `{ year, correct, band, direction }`
- `attemptsSpent` — number of "Listen" button presses (used for audio unlocking, NOT life counter)
- `lockedUntil` — soft-lock timestamp if daily limit reached early

**Life counter logic**: lives are based on `omenState.guesses.length`, not `attemptsSpent`. One life is lost per wrong guess, not per listen. `attemptsSpent` only controls whether the audio button is available for the current attempt.

---

## Navigation gotcha — logo click

When a player has `omenState.opened = true` in localStorage (i.e. they've entered the daily game), clicking the logo from another page would trigger a re-hydration that lands them on `OmenCard` instead of the home menu.

Fix: logo click (from other pages) sets `sessionStorage.setItem('tdb:go-menu', '1')`. On `app/page.tsx` mount, if this flag is present, `omenState.opened` is reset to `false` before rendering, and the flag is cleared.

---

## Multiplayer rooms

Room state is a JSON blob in KV. Structure defined in `lib/roomTypes.ts`.

- `setRoom` / `addPlayerToRoom` in `lib/roomStorage.ts` each throw on KV failure — wrap in individual try/catch in the API routes.
- Polling during `'lobby'` phase is required for guests to detect when the host starts the game. The polling `useEffect` in `DeathmatchClient.tsx` must include `'lobby'` in its condition.
- When the host starts the game (`room.status === 'active'`), guests detect it via poll and transition from `'lobby'` to `'playing'`.

---

## Resend / Email

- Resend SDK returns `{ data, error }` — it does **not** throw on failure. Always check `error` after calling `resend.emails.send()`.
- Log errors with `JSON.stringify(error)` — the Resend error object doesn't stringify cleanly with `console.error(error)` alone.
- `generateMagicToken()` calls `kv.set()` — if KV is not configured, this throws. Wrap it in try/catch returning 503.
- `EMAIL_FROM` must be a domain you've verified in Resend (or use their test domain `onboarding@resend.dev` for testing).

---

## CSS animations

Defined in `app/globals.css`:

- `text-glitch` — mostly idle; glitches at 88–91% keyframe with `translateX`, `skewX`, crimson text-shadow. Applied to menu items in `SealedEntry.tsx` with staggered durations (7/11/9/13/8s) and delays (0/2.3/4.7/1.1/6.2s) so they never fire together.
- `sheep-float` — gentle 5s `translateY(-5px) rotate(0.4deg)` loop on the sheep card.
- `animate-fadein` — used on screen transitions.
- `animate-pulse-gold` — loading state pulse.

---

## Practice mode

- Pool source: `MULTI_SHEET_URL` Google Sheet (same as deathmatch), via `fetchMultiPool()` in `lib/songPool.ts`.
- Session exclusion: played track IDs are accumulated in React state (`playedIds`) and passed as a comma-separated `?exclude=` query param to `GET /api/practice`.
- The API filters the pool against excluded IDs, samples one, enriches via Deezer, returns `{ entry, trackId }`.
- When the pool is exhausted, API returns `{ entry: null, exhausted: true }` — UI shows "You've heard them all."
- `playedIdsRef` is kept in sync with `playedIds` to avoid stale closures in `handleNext`.

---

## Sheep assets

| File | Used for |
|---|---|
| `public/assets/sheep-card.jpg` | Default menu card (not played yet / in progress) |
| `public/assets/sheep-success.png` | Menu card when player has solved today's omen |
| `public/assets/sheep-fail.png` | Menu card when player has failed (3 wrong guesses) |
| `public/assets/sheep-head-removebg-preview.png` | Life counter — alive |
| `public/assets/sheep-life-dead-removebg-preview.png` | Life counter — consumed (dead) |

All life counter and success/fail images must have transparent backgrounds — the originals without `-removebg-preview` suffix had white backgrounds and looked broken.

---

## Things to be careful about

- **Committing secrets** — never put `RESEND_API_KEY`, `KV_REST_API_TOKEN`, or any credential in code or git. Env vars only.
- **Deezer preview caching** — do not cache preview URLs for more than a few hours. They expire.
- **`server-only`** — `lib/db.ts` and other server libs import `server-only` to prevent accidental client bundling. Don't remove it.
- **React 19 + Next.js 15** — `'use client'` is required on any component that uses hooks or browser APIs. Server Components cannot use `useState`, `useEffect`, etc.
