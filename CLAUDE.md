# GlobalCeilidh — Master Project Briefing

_Last refreshed 2026-06-29._

## WHO I AM
I'm Whitey, building GlobalCeilidh.com and LewisHighlandGroup.com under Lewis Highland Group LLC.
Both sites are live on Vercel connected to GitHub.

## THE MISSION
GlobalCeilidh.com is a Scottish Gaelic language learning platform — think Duolingo but rooted in
Highland culture, diaspora identity, and community. The lesson engine is called **Abair De**.
The flagship lesson location is **An Cafaidh Balla Cloiche** (The Stone Wall Café).

**Sruth** is a companion project: a Scottish Gaelic culture & language newsletter (Sruth has shipped
through Nº 011 as of 2026-06-09; cadence is now weekly+).

**An Tonn** is a Sruth-adjacent weekly culture chronicle — magazine layout at `/AnTonn` and a 3D
fisheye-dome prototype at `/AnTonn/preview`.

**An Saoghal** is the interactive Gàidhlig world map at `/saoghal` (100 documented place-name pins).

**Ceilidh Rooms** is the WebRTC video room layer (`/rooms/an-cidsin` is live, public-access MVP).

---

## HOW TO WORK WITH ME
- I lose context between sessions — always start from this file and `C:\Dev\GC_Master.md`.
- Don't ask me to recreate lost conversation — move forward.
- Be direct, concise, decisive — I want to get things DONE.
- Aileen is my AI design consultant voice — her feedback carries weight.
- ADHD-style: I context-switch between projects fluidly. Don't push linear single-track sessions.

---

## PROJECTS AT A GLANCE

| Project | Path | Type | Stack |
|---------|------|------|-------|
| **global-ceilidh** | `C:\Dev\global-ceilidh` | Next.js web | Next.js 16 (App Router), Clerk, Supabase, MapLibre, R3F, LiveKit, Vercel |
| **gc-app** | `C:\Dev\gc-app` | Expo mobile | Expo SDK 54, RN 0.81, React 19, Supabase |
| **sruth-backend** | `C:\Dev\sruth-backend` | FastAPI API | Python, FastAPI, APScheduler, Anthropic + Gemini + OpenAI, Resend, faster-whisper |
| **sruth-admin** | `C:\Dev\sruth-admin` | Electron + Vercel web | Electron 33, React 18, Vite, Clerk |
| **cuilidh** | `C:\Dev\cuilidh` | Electron desktop (local-only) | Electron, React, Vite, Anthropic SDK |
| **gaidhlig-tts** | `C:\Dev\gaidhlig-tts` | Local corpus + recording (no git yet) | Python stdlib, Audacity |

All app projects share a **Supabase PostgreSQL** database and use **Anthropic Claude API**. Clerk
production keys are live across global-ceilidh, sruth-admin, and sruth-backend as of 2026-06-19;
sruth-admin's Vercel build fully Clerk-gated as of 2026-06-25.

---

## ACTIVE DEADLINES (as of 2026-06-29)

- ✅ **2026-05-02** — ACGA meeting on Gàidhlig + AI; EIST integration approved
- ✅ **2026-05-15** — Sruth Issue 1 shipped
- ✅ Sruth has shipped through Nº 011 (2026-06-09); cadence weekly+
- **Open** — Rooms MVP needs Clerk re-attached (currently public-access only — see landmines)
- **Open** — `gc-app` in-flight rewrite (uncommitted on disk since 2026-06-20) — finish or commit
- **Open** — Cùilidh Phase 1 RAG (paused; roadmap in `C:\Dev\cuilidh\ROADMAP.md`)
- **Pitch deck** — Lorg na Càraidean needs to feel finished for screenshots/recording

---

## PROJECT 1 — global-ceilidh (Next.js Web App)

### GitHub
`Globalceilidh/global-ceilidh` — deployed to Vercel; apex `globalceilidh.com` is Production (www
307-redirects to apex).

### Tech Stack
- **Next.js 16** App Router (plain JS, no TypeScript), **Tailwind CSS**
- **Clerk 7** auth (`pk_live_`) + webhook syncing users to Supabase
- **Supabase JS 2.103** (service-role direct)
- **MapLibre GL 5.24** — globe-projection map for `/saoghal`
- **@react-three/fiber 9.x** on React 19 + Three.js — `/AnTonn/preview` 3D dome
- **LiveKit Cloud** + `@livekit/components-react` — `/rooms`
- **Resend 6.12** — welcome emails via `/api/subscribe`
- **Svix 1.90** — webhook signature verification
- **Vercel Analytics** + **Speed Insights**

### Live surfaces
- `/` — coming-soon hero with JS-measured hotspots (desktop + mobile portrait); top → `/sruth`, bottom → text block
- `/sruth` — signup form + (expired) countdown to May 15
- `/sruth/archive` — Supabase-direct ISR archive (`html_archive` column on `sruth_newsletters`)
- `/sruth/archive/[slug]` — issue iframe with `<base target="_blank">`
- `/news` — three-density-tier news feed from `sruth_website_queue`
- `/news/feed.xml` — RSS
- `/feisean` — Highland Games + fèisean (ASGF static + Sruth-detected merge)
- `/coming-soon-features` — roadmap placeholder
- `/AnTonn` — magazine cover hub (PNG + hotspot map)
- `/AnTonn/this-week` — full weekly issue
- `/AnTonn/{music,books,podcasts,film,radio,archive,vote,methodology}` — per-vertical pages
- `/AnTonn/preview` — **3D fisheye-dome prototype** (R3F; rebuilt 2026-06-27/28, v1 → v18.1)
- `/saoghal` — MapLibre globe of the Gàidhlig world (100 pins, gold heat layer, EN/GD toggle)
- `/rooms/an-cidsin` — LiveKit WebRTC room (MVP, public access, **Clerk gate currently off**)
- `/home` — gated home (Aileen video, mission, features)
- `/ionnsaich` — Learn hub + Abair Dè
- `/coimhearsnachd`, `/meadhanan`, `/tachartasan`, `/naidheachd` — community / media / events / news

### Pre-launch gate (middleware.js)
- Public prefixes: `/sruth`, `/feisean`, `/coming-soon-features`, `/api/`, `/_next/`, `/favicon`
- Gated: `/home`, `/ionnsaich`, `/news`, `/AnTonn`, `/saoghal`, `/rooms` (auth disabled for MVP)
- `?key=6776` sets a 30-day `gc_access` cookie → redirects to `/home`
- **Vercel preview hosts (`*.vercel.app`) skip the gate** (added 2026-06-27 so An Tonn preview testing works without setting the cookie)

### What's built and working (cumulative)
- Supabase schema, Migrations 001 / 002 applied
- RLS protecting user data
- Clerk auth on production instance (pk_live_); webhook at `/api/webhooks/clerk` syncs users
- LessonEngine connected to Supabase — pulling live phrases, phonetics, grammar notes for Unit 1 / An Cafaidh / Toiseachadh level
- Sruth signup → `/api/subscribe` (rate-limited 5/IP/hour, email regex + MX lookup, 32-byte unsubscribe token, Resend welcome email)
- One-click unsubscribe at `/api/unsubscribe/[token]`
- `/news` editorial feed (bilingual renderer, three density tiers, RSS)
- `/feisean` festivals & games (Phase 2d: merges published `sruth_festivals` with ASGF static)
- `/saoghal` — globe-projection MapLibre map, 45 weighted heat points + 100 cream pins (minzoom 5, fade 5→6), labels symbol layer (fade 6→7, dark halo), side panel with bilingual longform on 6 Wisconsin entries (Argyle, Caledonia, Rock Prairie, Milwaukee, Scotch Lane, Decorah Prairie + Glasgow Cemetery pin), EN/GD toggle (shared `LanguageContext`), keyboard (R reset, Esc close), NavigationControl + Reset button
- `/AnTonn` magazine — cover PNG hotspots, full `/this-week` issue, per-section pages, pilot data `data/week-2026-06-09.js`
- `/AnTonn/preview` — Three.js fisheye dome, drag-to-scroll wall (both axes wrap), vortex shader background pulled by mouse, filter panel + detail panel + Air an Tonn overlay, WebGL detect + error boundary + list-view fallback, prefers-reduced-motion auto-list, tab-hidden pause, off-screen SEO mirror, IBM Plex Mono served locally. Pilot data `data/week-2026-06-23.js`. Cover art for 20 music + 5 podcast tiles.
- `/rooms/an-cidsin` — LiveKit WebRTC room (MVP; **public access; auth temporarily off — see landmine**)
- All security keys rotated April 26 2026 (post Vercel breach); Sensitive flag set in Vercel
- Vercel deployed, analytics + Speed Insights live

### Known landmine — Clerk on `/rooms`
Clerk's live instance uses Account Portal `accounts.globalceilidh.com`. Cross-subdomain session
handshake doesn't propagate `__session` cookies from `accounts.*` to `.globalceilidh.com`, so
server-side `auth()` returns null on www/apex even when signed in. Client-side `useAuth().isSignedIn`
returns false for the same reason. Tried: server-side `redirectToSignIn`, middleware
`auth.protect()`, client `<SignedIn>/<SignedOut>`, `useAuth()` hook, Bearer-token-to-API.
**Current state:** Clerk auth disabled on `/rooms`; LiveKit JWTs minted only for
`access_tier='public'` rooms; group/paid tiers return 403. **Right fix next session:**
embed Clerk `<SignIn />` in a `/sign-in` route on the app domain, OR add `www.globalceilidh.com`
as a Clerk satellite domain (Pro feature).

### What's NOT built yet
- Practice and Challenge tabs (pedagogy not finalised)
- User progress tracking (`lesson_sessions`, `question_attempts`)
- Migration 003 (community chat schema)
- Units 2–10 lesson content
- Cosmetic redesign (warm, circular, spatial — approved but not started)
- CAPTCHA on subscribe form (Cloudflare Turnstile)
- Supabase RLS policy on `sruth_subscribers`
- Sgrùdadh native-speaker QA queue at `/sgrùdadh` (first content type = 100 `/saoghal` places)

### Key Files
```
app/layout.js                    Root layout: Clerk, LanguageProvider, fonts
app/page.js                      Coming soon (hotspot overlays)
app/sruth/page.js                Sruth signup page (form, countdown)
app/sruth/archive/page.js        Archive list (ISR 5 min)
app/sruth/archive/[slug]/page.js Issue iframe
app/(main)/home/page.js          Real GC home (AileenVideo, hero, stats)
app/(main)/ionnsaich/page.js     Learn hub
app/news/page.js                 News feed + category filters
app/news/[slug]/page.js          News permalink
app/feisean/page.js              Festivals & Games
app/saoghal/page.js              MapLibre globe (100 pins + heat + side panel)
app/saoghal/heat.js              45 weighted HEAT_POINTS
app/saoghal/places.js            100 Gàidhlig place-name entries (6 with bilingual longform)
app/AnTonn/page.js               Cover hotspot map
app/AnTonn/this-week/page.js     Full weekly issue
app/AnTonn/preview/page.js       R3F fisheye dome shell
app/AnTonn/preview/PreviewShell.js   WebGL detect + error boundary + ListView fallback
app/AnTonn/preview/CylinderClient.js Canvas + vortex + cylinder gallery + overlays
app/AnTonn/preview/components/   CylinderGallery, CylinderTile, SphereGallery, SphereTile,
                                 Tile, VortexBackground, vortex.glsl.js, DetailPanel,
                                 FilterPanel, AirAnTonnOverlay, CloseButton, ListView
app/AnTonn/preview/hooks/useCylinderControls.js
app/AnTonn/preview/data/week-2026-06-23.js
app/rooms/an-cidsin/page.js      LiveKit room
app/api/subscribe/route.js       Email signup (rate-limited)
app/api/unsubscribe/[token]/route.js
app/api/webhooks/clerk/route.js  Clerk → Supabase users sync
app/api/preview/welcome|announcement/route.js  Email previews
components/LessonEngine.js       Interactive lesson player
components/Navigation.js, Footer.js, AileenVideo.js, SruthSignupModal.js
context/LanguageContext.js       en/gd toggle
lib/supabase.js                  Service-role client
middleware.js                    Pre-launch gate (cookie key); skips on *.vercel.app
public/fonts/IBMPlexMono-Medium.woff   Self-hosted for An Tonn
public/AnTonn/cover.png          Cover hub hotspot canvas
```

### Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
RESEND_API_KEY
LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL  # for /rooms
```

---

## PROJECT 2 — gc-app / Lorg na Càraidean (Expo Mobile App)

### What It Is
iOS/Android vocabulary matching game branded as **Lorg na Càraidean** ("Find the Pairs") under the
**Sgioba Ceilidh** team identity. Gaelic word pairs on a 4×4 card grid, landscape only. GC Kids
characters (Alba, U, Maple, GB, Awzi, Paddy, Nuwz, Siobhan, Piper, Sasha, Ruadh) rotate as tutors
by level. Designed around the Sniomh (swirl) motif. Codebase identifiers stay `gc-app`; only the
in-product brand and `app.json` display name carry the new game name.

### Status (2026-06-29)
- 2 commits on `main`, both 2026-04-24 (initial scaffold + full matching game)
- **Active rewrite uncommitted since 2026-06-20**: `App.js` +182, `MatchingGame.js` +581, `app/index.js` removed, `package.json` restructured, lockfile rewritten (-1617 / +1028 net). Substantial in-flight rework.
- Decision: pick this up to a stopping point and commit, OR shelve cleanly. Two-week-old uncommitted rewrite is risky.

### What's built and working (committed state)
- 10 levels, all 4×4 grid (8 pairs); difficulty scales via flip speed + emoji hints + vocab unit
- Sniomh SVG spiral on card backs; per-phase static stone-card backgrounds (videos retired for perf)
- Card flip animation (rotateY spring); match celebration spin (1260°) reveals bg image portion
- Green → yellow → red phase system: 3 misses per phase, 1 swirl lost per exhausted phase
- 3 swirls total → game over
- Per-level win reveal: image + Pika-rendered video override (`revealImage` / `revealVideo` per level)
- Sound effects fully wired: match, wrong, complete, gameover (.mp3 in `assets/sounds/`)
- Vocab loads from Supabase for Unit 1; fallback vocab hardcoded in App.js for Units 2–5
- Splash screen `SgiobaCeilidh_LNC_Splash.png`; tap-to-start advances to LevelSelect

### What's NOT built yet
- Finish (or shelve cleanly) the 2026-06-20 rewrite
- Vocab Units 2–5 in Supabase (fallback works for now)
- Win reveal image + video for levels 4–10
- Card art remaining: Unit 2 (Brot, Uisge), Unit 3 (colours, 8 pairs), Unit 4 (family, 8 pairs), Unit 5 (landscape, 7 of 8 + Speur typo fix `_dealabh` → `_dealbh`)
- PWA version for globalceilidh.com; web version of matching game
- EAS build (currently Expo Go only); persistent score storage; analytics; auth

### Key Files
```
App.js                         Root: splash → vocab load → level select → game (UNIT_VOCAB)
app.json                       Expo config (landscape, name: "Lorg na Càraidean")
components/MatchingGame.js     Core game + CARD_ASSETS map + per-level reveals
components/LevelSelect.js      10-tile picker, GC Kids bubble
components/SniomhCard.js       SVG spiral (card-back fallback)
lib/levels.js                  10 level defs + CHARACTERS + SILHOUETTES maps
lib/{supabase,sounds,speech}.js
assets/images/...              Splash, stone backs, character art, reveal images
assets/sounds/{match,wrong,complete,gameover}.mp3
```

### Vocabulary by Unit
```
Unit 1: Cù, Taigh, Bò, Cat, Eun, Iasg, Craobh, Muir (animals/nature) — loaded from Supabase
Unit 2: Cofaidh, Tì, Brot, Arán, Im, Bainne, Uisge, Càise (café food/drink)
Unit 3: Dearg, Gorm, Uaine, Buidhe, Geal, Dubh, Orains, Pinc (colours)
Unit 4: Athair, Màthair, Bràthair, Piuthar, Mac, Nighean, Bodach, Cailleach (family)
Unit 5: Grian, Gealach, Reul, Sneachda, Gaoth, Speur, Abhainn, Eilean (landscape/weather)

Level → Unit: 1–3=Unit 1, 4–5=Unit 2, 6–7=Unit 3, 8–9=Unit 4, 10=Unit 5
```

### Environment
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

---

## PROJECT 3 — sruth-backend (FastAPI)

### What It Is
Backend for the Sruth newsletter + GlobalCeilidh editorial pipeline. Ingests Scottish Gaelic content
from 60+ RSS / Playwright web / Facebook public sources; classifies and scores relevance; composes
editorial newsletters; manages subscriber lists; provides admin API. Hosted on **Railway** with
APScheduler running in-process crons.

### Tech Stack
- **FastAPI 0.115**, Uvicorn, **APScheduler** (Europe/London tz)
- **Supabase Postgres** (SQLAlchemy + service-role), **Upstash Redis** (Celery broker, mostly unused in prod)
- **Anthropic SDK 0.34** (Opus 4.7), **OpenAI** (GPT-5-mini for Council), **Gemini 2.5 Flash** (classification + Council + grounded discovery)
- **faster-whisper 1.0.3** + EIST Edinburgh `whisper-large-v3-turbo-gaelic-ct2-v2` (Phase 1 STT)
- **Playwright** (headless Chromium, Windows Proactor loop), **feedparser**, **httpx**
- **Resend 2.4**; **Clerk JWT** validation + legacy X-Admin-Key
- **Celery 5.4** (kept for local docker-compose; not used in prod)

### What's built and working
- Daily 06:00 London ingestion (APScheduler) — fetch all active sources (concurrency 5), dedupe by content hash, insert raw items
- 05:45 London article-search pipeline (Gemini-grounded, link-resolved, per-source capped, section-gate contract)
- Classify pass (Gemini fallback) → relevance / category / summaries; route to morning brief / newsletter queue / website queue
- Auto-draft 06:30 London — single Opus call pre-builds morning issue
- Festival detection in-line with processing; daily 00:00 UTC expiry
- News archive 03:00 London — hides items >30 days
- STT Phase 1+2 wired: audio enclosures auto-transcribed into `body_text` before classify
- AI Council of Elrond (`/workbench/council`) — parallel fan-out across Anthropic Haiku + GPT-5-mini + Gemini Flash, Sonnet 4.6 synthesis; budget gate hard-stops at daily $5; web search enabled 2026-06-25
- Council clarification round (`POST /workbench/councils/{id}/refine`) — Sonnet pass over Scott's answers to open questions
- Council read-ahead: `build_council_system()` reads `projects-status.md` + `globalceilidh-stack.md` + `workbench.md` from `app/llm/council_context/` at every fan-out
- Editor Review workflow (migration 025) — editor-facing API under `/editor/*`; admin endpoints `send-for-review`, `close-review`, `corrections` list/apply/reject; Principal extended with email claim
- Resend webhook ingest (`/webhooks/resend`, Svix-signed, idempotent on `(resend_email_id, event_type, occurred_at)`) → per-issue engagement (opens / clicks / bounces / recipients)
- Newsletter HTML template (V19+): Fraunces + IBM Plex Mono, umber accent (#6B4E1F), wordmark as hosted PNG, 96×64 story thumbs, per-image width override (200–600px), `html_archive` written on real send only
- Section types: Fàilte · Facal an Là / An t-Abairt · Òran · Diaspora · Cidsin · GC Update · Reviews · Mixer · Image · Na Sàraichean · Best Of · Rach a-muigh agus cluich · Parting Shot · Partner
- Article-archive `GET` + `PATCH /newsletter/issues/{id}/archive-html` lets admin edit past-issue HTML
- Newsletter send: per-recipient (no list leak), throttled ≤5 req/s, per-recipient failures returned, `/resend-to` for retries, `/bulk-unsubscribe` for hard-bounce cleanup
- Cost tracking: `sruth_costs` table, `/costs/summary` aggregates Anthropic + OpenAI + Gemini + Resend per operation
- Discovery v2 (Gemini-grounded, capped 10/run, gold flag + WordPress sub-feed cascade)
- File upload `POST /assets/upload` → Supabase Storage `assets/stories/`
- Ceilidh Rooms schema (migration 024_rooms.sql): `gc_rooms`, `gc_groups`, `gc_group_members`, `gc_room_access_grants`, `gc_room_payments`

### Migrations index
- `001` core sruth schema
- `002` subscribers
- `003` archive
- `004` sections
- `005` brief flags
- `020` send-event tracking
- `021` workbench (`gc_workbench_*`, `gc_editors`, `gc_review_items`)
- `022` workbench governance (Owner→Board→Council→Builders→Reviewers; codex_scope CHECK constraint)
- `023` council clarification (clarifications + final_brief on `gc_workbench_councils`)
- `024` rooms
- `025` editor review

### What's NOT built yet
- STT Phase 3 — `POST /transcribe` (multipart audio + admin auth) so Cùilidh / GC.com / gc-app share one model deployment
- Optional: dedicated `transcript_text` column on `sruth_raw_items` (currently folded into `body_text`)
- Pessimistic edit-locking (`sruth_draft_locks` + take-over flow) — deferred until first real conflict
- Per-section signoff grid + send-gate (deferred from migration 025; you're the gate today)
- Auto-apply corrections back into `sections_config` (deferred; manual today)
- Editor management UI (use Supabase SQL editor today)
- Migration 003 (community chat schema — for global-ceilidh, not Sruth)
- Persistent Railway volume mount at `~/.cache/huggingface/` (EIST model re-downloads on cold start)

### Key Files
```
app/main.py                    FastAPI setup, CORS, scheduler, router registration
app/config.py                  Pydantic settings (env vars, Clerk, STT config)
app/database.py                Supabase client factory
app/routers/{brief,newsletter,sources,assets,auth,article_search,
             events,website_queue,festivals,discovery,webhooks,
             editor_review,workbench}.py
app/workers/{ingestion,processing,festival_detection,auto_draft,
             events_import,article_search,section_gates,celery_app}.py
app/services/{stt_service,audio_ingest}.py
app/scrapers/{rss,playwright_scraper,discovery_validate,events/*}.py
app/llm/{claude,gemini,openai,workbench,costs,budget}.py
app/llm/council_context/{projects-status,globalceilidh-stack,workbench,GC_Master}.md
app/email/template.py          Newsletter HTML builder (V19+)
app/auth/                      Clerk JWT (JWKS 10-min cache) + legacy key
migrations/001..025_*.sql
scripts/{export_subscribers,test_stt,transcribe_audio}.py
SETUP_EDITORS.md               Editor Review deploy runbook
DEPLOYMENT.md, DISASTER_RECOVERY.md
```

### Pricing Constants (app/llm/costs.py)
```python
ANTHROPIC_INPUT_PER_MTK  = 15.00
ANTHROPIC_OUTPUT_PER_MTK = 75.00
RESEND_PER_EMAIL = 0.0008
```

### Environment Variables (Railway)
```
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY
RESEND_API_KEY
CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
ADMIN_SECRET_KEY                 # legacy X-Admin-Key (still accepted)
PUBLIC_BASE_URL
UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
STT_ENABLED=true, STT_MODEL=eist-edinburgh/whisper-large-v3-turbo-gaelic-ct2-v2,
STT_DEVICE=cpu, STT_COMPUTE_TYPE=int8
TZ=Europe/London
```

---

## PROJECT 4 — sruth-admin (Electron Desktop + Vercel Web)

### What It Is
Editorial control surface for Sruth. Dual deploy: Electron desktop locally + Vercel web at
`https://admin.globalceilidh.com`. React 18 + Vite + Clerk; falls back to `X-Admin-Key` only on the
Electron / local dev path (web build had the admin key removed from env 2026-06-25).

### What's built and working
- All editorial pages: Morning Brief, Issue Builder (14 section types), Sources, Discover Sources, Events Review, News Review, Festivals Review (+ Expired tab), Subscribers, History, Costs, **Workbench** (AI Council), **EditorCorrections** (admin reviews editor markups)
- **EditorShell** layout for users with `publicMetadata.role=editor` — no sidebar, only `/editor` + `/editor/issue/:id` reachable; admins get the full App
- **Workbench page** (`/workbench`) — multi-LLM fan-out UI: question + context + project area + model toggles → three opinion cards + Sonnet synthesis + "Copy as brief for Claude Code" button; answer form + final brief for clarification round; Past Councils panel
- **History engagement panel** — per-issue opens / clicks / bounces / recipients (opens column hides when tracking is off)
- **History edit-archive button** — `HtmlCodeField` syntax-highlighted HTML editor for past-issue corrections
- **Mixer** — syntax-highlighted HTML editor + Format button + "Convert commas → ⚜" (incl. back-to-back `</a><a>`); fleur-de-lis separator instead of comma
- **Festivals Review** Phase 3 — Expired tab
- **Best Of**, **GC Update** (4-tile layout, max 3 images each, vertical stacking variant), **An t-Abairt**, **Na Sàraichean** renderers
- **Rach a-muigh agus cluich** section (closer image)
- **Gaelic keyboard** (10 accented vowels: à è ì ò ù + caps) — onMouseDown + preventDefault to avoid stealing focus; native input value setter so React controlled inputs keep fada chars
- **Send to Editors** button on IssueBuilder
- **Sign Out** button (always renders with fallback for non-Clerk path)
- API client (~60 methods) with cache-busting GETs, Clerk Bearer → fallback X-Admin-Key
- Vercel rewrites: `/api/*` → Railway, `/(.*)` → SPA
- Wordmark PNG generator (Puppeteer → Fraunces italic bold → crops to element)

### Clerk status (2026-06-29)
- **Web build (admin.globalceilidh.com): fully Clerk-gated.** `VITE_ADMIN_KEY` removed from Vercel env 2026-06-25 (was being baked into the public bundle, granting admin access to anyone hitting the URL). `VITE_CLERK_PUBLISHABLE_KEY` set; `AppWithClerk.getToken({ template: 'session' })` carries `public_metadata.role`; tokenGetter registered during render to dodge the page-load 401 burst.
- **Electron / local dev**: still uses `VITE_ADMIN_KEY` legacy path.
- **Action remaining**: confirm in Clerk dashboard that the GlobalCeilidh app (`pk_live_Y2xlcmsuZ2xvYmFsY2VpbGlkaC5jb20k`) is what's wired up — NOT the orphaned Sruth Admin app. Smoke-test: sign in as `globalceilidh@gmail.com` (role:admin), confirm sidebar visible. Sign in as Lewis/Joe, confirm EditorShell.

### What's NOT built yet
- Issue number auto-increment (hardcoded)
- Story selection persistence when navigating back from Issue Builder
- AI Council Past Councils detail-view page (history endpoint exists, list page exists, detail-rerun page next)
- Editor management UI (use Supabase SQL today)
- Editor Council per-section signoff grid + send-gate (deferred from migration 025 design)

### Key Files
```
src/main/{index.js,preload.js}              Electron main + IPC bridge
src/renderer/main.jsx                       Clerk provider + router tree (web entry)
src/renderer/AppWithClerk.jsx               Role → EditorShell or App; getToken bridge
src/renderer/App.jsx                        Admin sidebar + routes
src/renderer/EditorShell.jsx                Minimal editor layout
src/renderer/api/client.js                  ~60 API methods, cache-bust GETs
src/renderer/pages/{Brief,IssueBuilder,Sources,DiscoverSources,
                    EventsReview,NewsReview,FestivalsReview,
                    Subscribers,History,Costs,Workbench,
                    EditorQueue,EditorReview,EditorCorrections}.jsx
src/renderer/components/GaelicKeyboard.jsx  Floating fada picker
scripts/{generate-icon,generate-wordmark}.js
vercel.json                                 Rewrites + no-store /api/* headers
```

### Environment (.env)
```
VITE_API_URL=http://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=...      # canonical name — must match GlobalCeilidh Clerk app
VITE_ADMIN_KEY=...                  # Electron/local only; REMOVED from Vercel
```

---

## PROJECT 5 — Cùilidh (Personal Gaelic Tutor)

### What It Is
**Cùilidh — Tìdsear Pearsanta** ("Personal Tutor") — Scott's personal Scottish Gaelic tutoring app
at `C:\Dev\cuilidh`. Electron desktop app that ingests Gaelic learning materials (PDFs) and uses
them as context for one-on-one conversational tutoring with Claude. Tracks sessions, generates AI
tutor notes, monitors API spend with prompt caching.

**Standalone** — does NOT call sruth-backend, Supabase, or any other component of the GlobalCeilidh
stack. Personal local-only tool.

### Tech Stack
- Electron 33 + React 18 + Vite (dev port 4747) + HashRouter
- `@anthropic-ai/sdk` 0.36.0 — Claude API client
  - **Opus 4.7** for ingestion + session summaries
  - **Sonnet 4.6** for chat
  - Two-block prompt caching: static docs + session notes (90% read discount after first message)
  - SDK v0.36 still uses `node-fetch` v2 internally (relevant to TLS landmine below)
- `pdf-parse` 1.1.1 — PDF text extraction
- `electron-store` 8.2 — persistent local data at `%APPDATA%\cuilidh\cuilidh-data.json`
- `win-ca` 3.x — installed 2026-06-24 as part of Norton TLS fix attempt; **currently inert** (not `require`d)

### Pages
1. **Tutor (`/`)** — chat header with live indicator, message thread, textarea. START → tutor greeting in Gaelic. END → Claude generates 3–5 sentence tutor notes
2. **Library (`/library`)** — upload PDFs; on upload `ingest-pdf` calls Opus to extract vocab/phrases/grammar/themes
3. **History (`/history`)** — sessions reverse-chronological with AI tutor notes + full transcript
4. **Costs (`/costs`)** — total spend, last 30 days, total calls, cache hit rate; per-operation table; last 30 calls

### Status (2026-06-29)
- Single commit `a4eaa0e` (2026-04-30); functional prototype
- **Uncommitted:** TLS workaround in `src/main/index.js`, `package.json` win-ca dep, `ROADMAP.md` (4-phase), `launch-cuilidh.vbs` silent launcher — commit before Phase 1 work starts
- **TLS landmine (2026-06-24, FIXED):** Norton 360 silently turned on HTTPS interception against `api.anthropic.com`, re-signing with Norton's own root CA. Node doesn't read the Windows cert store, so Anthropic SDK threw `UNABLE_TO_VERIFY_LEAF_SIGNATURE` and the Tutor screen hung on three-dots indicator. `win-ca` didn't take (SDK's bundled `node-fetch` doesn't pick up the patched root). Final fix: `process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'` at top of `src/main/index.js`, before any other imports. Acceptable trade-off (single outbound endpoint, single home machine)
- **Epistemic honesty patch (2026-06-24):** added EPISTEMIC HONESTY block to static system prompt so Sonnet hedges with "chan eil mi cinnteach / I'm not sure" when uncertain rather than inventing Gàidhlig. Cheapest grounding move; doesn't displace Phase 1 RAG

### Roadmap (paused, in `ROADMAP.md`)
1. Phase 1 — text RAG core
2. Phase 2 — corpus depth + Am Faclair Beag dictionary
3. Phase 3 — Èist voice-in
4. Phase 4 — XTTS voice-out from gaidhlig-tts recordings (pre-work: ask one speaker for 30-min continuous monologue beyond corpus sentences)

### Key Files
```
src/main/index.js              Electron main; IPC; Anthropic API; PDF processing
                               (TLS reject-unauthorized at top — Norton workaround)
src/main/preload.js            Context bridge
src/renderer/{main.jsx,App.jsx,index.css}
src/renderer/pages/{Tutor,Library,History,Costs}.jsx
.pdf_text/                     Extracted PDF metadata
extract_pdfs.js, build_store.js, seed-docs.js
launch-cuilidh.vbs             Windows silent launcher (untracked)
ROADMAP.md                     4-phase plan (untracked)
.env                           ANTHROPIC_API_KEY (git-ignored)
```

### Build / deploy
- `npm run dev` — Vite (4747) + Electron with DevTools
- `npm start` — Electron production
- No CI/CD, no electron-builder, no Vercel/Docker
- Launched via `launch-cuilidh.vbs` (silent)

---

## PROJECT 6 — gaidhlig-tts (Local corpus + voice pipeline)

### What It Is
Scottish Gàidhlig **voice corpus + TTS/ASR pipeline**. Long-term aim: voice-in / voice-out
conversational AI (ASR → LLM → TTS) anchored on the **EIST Edinburgh** ASR partnership (same group
as ARCOSG). Short-term: build a clean recording corpus, ship USB mics to volunteer speakers
(Audacity → WAVs back), feed into ASR fine-tune + per-voice TTS.

### Status (2026-06-29)
- **Corpus phase complete** — `gaelic_speech_corpus.csv` = **5,095** unique Gàidhlig sentences, UTF-8 with BOM. Sources: Tatoeba 707, FLORES-200 545, ARCOSG ~3,843
- **Recording phase started** — 2× Rode USB mics shipped (~$300); mic-passing model, 2 active speakers, target 4–5
- **Not yet under git** — local-only; will initialise once first round of recordings is QC-clean

### Pipeline (planned, once recordings come in)
QC → forced alignment → dataset packaging → ASR fine-tune (target partner: **Èist** / EIST
Edinburgh) + per-speaker TTS training → wire into Pipecat / LiveKit conversational loop.

### Layout
```
gaidhlig-tts/
├── build_corpus.py            Stdlib pipeline: Tatoeba + FLORES-200 + ARCOSG → CSV
├── gaelic_speech_corpus.csv   The corpus (5,095 sentences)
└── cache/                     Cached source downloads
```

---

## SHARED INFRASTRUCTURE

### Supabase Database (key tables)
```
# Lessons
immersion_locations            Lesson locations (e.g. cafaidh)
units                          Curriculum units per location/level
lesson_items                   Vocabulary: gaelic, english, image_url, emoji, sort_order
lesson_sessions                User progress (not yet built)
question_attempts              Per-question tracking (not yet built)

# Users / auth
users                          Clerk → Supabase webhook sync

# Sruth editorial pipeline
sruth_sources                  RSS / Playwright / Facebook / events sources
sruth_raw_items                Ingested items (status: pending → processing → processed)
sruth_newsletter_queue         Items awaiting approval for next issue
sruth_newsletters              Sent issues + drafts (html_archive for public archive)
sruth_website_queue            News page items (pending → approved → published → archived)
sruth_festivals                Highland Games / fèisean (review_status pending/published/rejected/expired)
sruth_events                   Event calendar
sruth_subscribers              Email signups (unsubscribe_token)
sruth_source_candidates        Staging for discovery results
sruth_send_events              Resend webhook event log (unique on (resend_email_id, event_type, occurred_at))
sruth_costs                    Per-call cost ledger
sruth_editor_corrections       Editor markup submissions (migration 025)

# Workbench / governance (migrations 021-023)
gc_workbench_tasks             Task tracker (with codex_scope CHECK constraint)
gc_workbench_councils          AI Council fan-outs (clarifications + final_brief from 023)
gc_workbench_council_responses Per-model opinion + synthesis row
gc_editors                     Active editor roster
gc_editor_signoffs             Per-section editor approval (UI pending)
gc_editor_overrides            "Send anyway" audit trail (UI pending)
gc_review_items                Sgrùdadh queue items (UI pending)
gc_ai_reviews                  AI pre-pass results per content type

# Ceilidh Rooms (migration 024)
gc_rooms                       Room registry (access_tier public/group/paid)
gc_groups                      Group memberships
gc_group_members
gc_room_access_grants
gc_room_payments
```

### Aileen — The Character
- Scotland flag figure (red-haired woman)
- Source image: `C:\Users\Scott\Desktop\Aileen_2_CGPT_3_20.png`
- Used as: design consultant voice (conceptual); no longer appears in gc-app
- gc-app uses GC Kids characters rotating by level

### GC Kids Characters
- **11 characters total** (originally 7, expanded 2026-05): Alba, U, Maple, GB, Awzi, Paddy, Nuwz, Siobhan, Piper, Sasha, Ruadh
- Source: `C:\Users\Scott\Desktop\GC-kids\`
- Two maps exported from `gc-app/lib/levels.js`: `CHARACTERS` (portraits) + `SILHOUETTES` (in-game)
- In-game silhouette by level: Alba(1), U/Sammy(2), Maple(3), Awzi(4), Siobhan(5), Piper(6), GB1(7), Sasha(8), Nuwz(9), Ruadh(10)
- Text speech bubbles only (Gaelic + English) — voice removed

### The Sniomh (Swirl) Motif
- Core design language across all GlobalCeilidh products
- SVG spiral component: `gc-app/components/SniomhCard.js`
- Used as: card backs in matching game, life currency icon
- NOT Celtic knots — specifically the Sniomh spiral form

### Auth (Clerk, fully promoted 2026-06-19)
| Surface | Current state |
|---|---|
| global-ceilidh | `pk_live_` / `sk_live_`; webhook sync to Supabase `users` |
| sruth-backend | Clerk JWT (JWKS 10-min cache) alongside legacy `X-Admin-Key` |
| sruth-admin (web) | Fully Clerk-gated (2026-06-25); `VITE_ADMIN_KEY` removed from Vercel |
| sruth-admin (Electron) | Still uses `VITE_ADMIN_KEY` legacy path |
| gc-app | None (anonymous Supabase) |
| cuilidh | None (local-only) |

---

## PENDING ITEMS (cross-project)

### High-leverage
- **Re-add Clerk auth to /rooms** — embed `<SignIn />` on `/sign-in` app-domain route OR Clerk satellite-domain config (Pro). Currently the public-only MVP works but group/paid rooms are stuck on 403.
- **Stripe Connect onboarding + paid-room Checkout** — Session 3 from the Rooms Council brief
- **Sgrùdadh QA queue** at `globalceilidh.com/sgrùdadh` — first content = 100 `/saoghal` places (all `verified: false`)
- **Reviewer outreach** (no code) — Fòram na Gàidhlig, SMO community board, ACGA, Scottish Gaelic Discord, Cape Breton networks
- **Verify public numbers** — NA fluent speaker count (~4,000), Duolingo gd active learners (~500,000), ACGA membership, NS native vs learner split

### Sruth
- Issue number auto-increment from `sruth_newsletters`
- Story selection persistence in Issue Builder
- Fix dead RSS source URLs (LearnGaelic, Speak Gaelic, Tobar an Dualchais, Kim Carnie, Julie Fowlis)
- AI Council Past Councils detail-view page
- Per-section signoff grid (Editor Council Path B)
- Auto-apply corrections back into `sections_config`
- Editor management UI

### gc-app / Lorg na Càraidean
- Finish or shelve the 2026-06-20 uncommitted rewrite
- Card art — Unit 2 (Brot, Uisge), Unit 3 (8), Unit 4 (8), Unit 5 (7 + Speur typo)
- Win reveal image + video for levels 4–10
- Seed Supabase with vocab Units 2–5
- PWA + web version of matching game
- EAS build

### global-ceilidh
- Lock pedagogy (question counts, lesson flow)
- Build Practice + Challenge tabs
- Wire user progress tracking
- Migration 003 (community chat)
- Cosmetic redesign pass
- CAPTCHA on subscribe (Cloudflare Turnstile)
- Supabase RLS on `sruth_subscribers`
- Realtime chat overlay on /rooms via Supabase Realtime
- Èist live Gàidhlig captions on /rooms (blocked on Èist API contract)

### Cùilidh
- Commit the uncommitted TLS workaround + ROADMAP + launcher
- Phase 1 — text RAG core
- Push to GitHub at some point so remote agents become an option

### sruth-backend
- STT Phase 3 — `POST /transcribe` for client apps
- Optional `transcript_text` column on `sruth_raw_items`
- Persistent Railway volume mount at `~/.cache/huggingface/`
- Pessimistic edit-locking (`sruth_draft_locks`)

### gaidhlig-tts
- Bring under git once first round of recordings is QC-clean
- Design dataset packaging step

---

## LANDMINES (don't relearn the hard way)

- **VITE_* env changes** require a fresh git push to Vercel — "Redeploy" reuses stale artifacts
- **Vercel env vars** must be set via web UI; PowerShell pipe injects a BOM
- **Supabase DDL** is applied manually in SQL editor; numbered migrations in `sruth-backend/migrations/*.sql` are source of truth
- **Windows + Playwright** needs forced Proactor event loop
- **Norton 360** silently intercepts HTTPS on the home PC, re-signing with its own root CA. Node doesn't trust the Windows store. Triggered by Norton auto-updates; not your code. Signature: env var `SSLKEYLOGFILE=\\.\nllMonFltProxy\...` shows up in the shell. Workaround for local-only tools: `NODE_TLS_REJECT_UNAUTHORIZED=0`
- **Clerk Account Portal cross-subdomain** doesn't propagate `__session` cookies from `accounts.*` to apex/www; `/rooms` auth currently disabled
- **`VITE_ADMIN_KEY` was being baked into the public Vite bundle** (sruth-admin) — anyone hitting `admin.globalceilidh.com` got an admin-credentialed bundle. Removed from Vercel 2026-06-25. Don't add it back to the web build.
- **`@anthropic-ai/sdk` v0.36** still uses bundled `node-fetch` v2 — `win-ca` / native cert-store fixes don't take. Relevant when an SDK upgrade lets us drop the `NODE_TLS_REJECT_UNAUTHORIZED=0` hack
