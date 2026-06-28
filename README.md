# THE DEATH OF BROWSING

A daily music guessing game. One record a day. Three attempts to name the year it was born. The album reveals itself at the end.

Live at **[thedeathofbrowsing.com](https://thedeathofbrowsing.com)**

---

## What it is

- **Daily game** — one track, shared globally. Resets every day at 07:00 UTC.
- **Multiplayer** — private rooms, shared songs, everyone guesses simultaneously. Up to 10 players, 3–10 rounds.
- **Practice** — endless session drawing from the multiplayer pool. No repeats within a session.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript / React 19 |
| Styling | Tailwind CSS + CSS variables |
| Database | Vercel KV (Upstash Redis) |
| Email | Resend |
| Music API | Deezer (preview CDN + metadata) |
| Song list | Google Sheets (gviz CSV) |
| Analytics | Vercel Analytics |
| Hosting | Vercel |

---

## Local setup

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

### Required environment variables

```
# Vercel KV (Upstash Redis)
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=

# Resend (email magic links)
RESEND_API_KEY=
EMAIL_FROM=hello@thedeathofbrowsing.com

# Daily omen Google Sheet (gviz CSV URL)
SHEET_URL=
MULTI_SHEET_URL=
```

Get KV credentials from the Upstash dashboard linked in your Vercel project.
Get a Resend API key from [resend.com](https://resend.com).

---

## Project structure

```
app/
  page.tsx              # Home / daily game
  about/                # The Story of Browsing
  archive/              # Past daily omens
  contact/              # Contact page
  deathmatch/           # Multiplayer lobby + game
  invite/               # Room invite redirect
  practice/             # Endless practice mode
  profile/              # Player profile
  api/
    daily/              # Serve today's omen
    practice/           # Random song from pool
    rooms/              # Multiplayer room CRUD + game flow
    deezer/             # Deezer proxy (album, track, preview, resolve)
    auth/               # Magic link request + verify + logout
    stats/              # Play/solve counters
    archive/            # Past entries list
    user/               # Profile data

components/
  daily/                # OmenCard, AlbumReveal, SealedEntry, RulesGate, …
  deathmatch/           # RoomLobby, DeathmatchRound, RoundReveal, Leaderboard
  ui/                   # Shared UI: DeadBrowserShell, ObituaryHeader, ArtifactCover, …
  audio/                # GlobalAudio singleton wrapper

lib/
  omenDeezer.ts         # enrichFromDeezer() — fetches live preview + metadata
  omenSheet.ts          # Fetch + parse daily omen from Google Sheet
  songPool.ts           # fetchMultiPool(), samplePool() — multiplayer/practice pool
  roomStorage.ts        # KV helpers for room state
  auth.ts               # Magic token generation + verification
  localState.ts         # localStorage omen state (guesses, solved, etc.)
  ambientAudio.ts       # Module-level ambient audio singleton
  dailyStateMachine.ts  # Daily game state transitions
```

---

## Deployment

Push to `main` → Vercel deploys automatically.

Make sure all env vars above are set in Vercel Project Settings → Environment Variables.

---

## Data sources

**Daily omen** — a Google Sheet with columns: `deezerTrackUrl`, `answerYear`, `editorialNote`. The sheet URL is set via `SHEET_URL`. The omen rotates by UTC date using row index.

**Multiplayer / Practice pool** — a separate sheet tab (`MULTI_SHEET_URL`) with the same schema. Used by deathmatch rooms and the practice API.

Deezer preview URLs are short-lived CDN links — they are fetched live at request time via `enrichFromDeezer()`, never cached permanently.

---

## Auth

Passwordless magic links via Resend. Flow:

1. User enters email → `POST /api/auth/request` generates a token, stores it in KV (`tdb:auth:<token>`), sends the link via Resend.
2. User clicks link → `GET /api/auth/verify?token=…` validates the token, sets a session cookie (`tdb:session:<sessionId>`), redirects home.
3. `GET /api/user/me` reads the session cookie and returns the current user.

---

*A side project by [Jaad](https://who-the-f-is-jaad.github.io/jaad/). Built because the feed needed to die.*
