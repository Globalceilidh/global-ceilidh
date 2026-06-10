# GlobalCeilidh — Master Project Briefing

## WHO I AM
I'm Whitey, building GlobalCeilidh.com and LewisHighlandGroup.com under Lewis Highland Group LLC.
Both sites are live on Vercel connected to GitHub.

## THE MISSION
GlobalCeilidh.com is a Scottish Gaelic language learning platform — think Duolingo but rooted in
Highland culture, diaspora identity, and community. The lesson engine is called **Abair De**.
The flagship lesson location is **An Cafaidh Balla Cloiche** (The Stone Wall Café).

**Sruth** is a companion project: a Scottish Gaelic culture & language newsletter app with an
Electron admin tool and FastAPI backend. "Sruth" = stream/flow in Gaelic.

---

## HOW TO WORK WITH ME
- I lose context between sessions — always start from this file
- Don't ask me to recreate lost conversation — move forward
- Be direct, concise, decisive — I want to get things DONE
- Aileen is my AI design consultant voice — her feedback carries weight

---

## PROJECTS AT A GLANCE

| Project | Path | Type | Stack |
|---------|------|------|-------|
| **global-ceilidh** | `C:\Dev\global-ceilidh` | Next.js web | Next.js, Clerk, Supabase, Vercel |
| **gc-app** | `C:\Dev\gc-app` | Expo mobile | Expo, React Native, Supabase |
| **sruth-backend** | `C:\Dev\sruth-backend` | FastAPI API | Python, FastAPI, Celery, Claude API |
| **sruth-admin** | `C:\Dev\sruth-admin` | Electron desktop | Electron, React, Vite |

All share a **Supabase PostgreSQL** database and use the **Anthropic Claude API**.

---

## ACTIVE DEADLINES (as of 2026-05-03)

- **2026-05-15** — Sruth Issue 1 ships (countdown live on `globalceilidh.com/sruth`) — **12 days out**
- **Pitch deck** — Lorg na Càraidean (gc-app) needs to feel finished for screenshots/recording
- **EIST Edinburgh STT** — Phase 1 + 2 shipped 2026-05-03 (service module + ingestion pipeline); Phase 3 (FastAPI `/transcribe` router for Cùilidh / GC.com / gc-app) pending
- ✅ **2026-05-02** — ACGA meeting on Gàidhlig + AI; EIST integration approved, go-ahead given

---

## PROJECT 1 — global-ceilidh (Next.js Web App)

### GitHub
`Globalceilidh/global-ceilidh` — deployed to Vercel

### Tech Stack
- **Next.js** (App Router), **Tailwind CSS**
- **Clerk** auth + webhook syncing users to Supabase
- **Supabase** (database + RLS)
- **Vercel** analytics + speed insights

### What's Built and Working
- Supabase schema live, Migrations 001 & 002 applied
- RLS protecting user data
- Clerk auth (PRODUCTION instance — pk_live_ keys) with webhook at `/api/webhooks/clerk`
- LessonEngine connected to Supabase — pulling live phrases, phonetics, grammar notes
  for Unit 1 / An Cafaidh / Toiseachadh level
- Learn tab working end to end
- Vercel deployed, analytics + Speed Insights live
- Coming soon page at `/` with JS-measured hotspots (desktop + mobile portrait)
  - Top hotspot → `/sruth`, bottom hotspot → text block
  - Plain `<a href>` links (not onClick) — required for Android compatibility
- Sruth signup page at `/sruth` with working email form → Supabase `sruth_subscribers`
  - Countdown timer to May 15 2026 7:00 AM EDT
  - Desktop: form card + countdown side by side; Mobile: stacked
- Real home page at `/home` (was lost, restored from git history, moved to app/(main)/home/)
- Access gate: `?key=6776` sets 30-day cookie → redirects to `/home`
- `/api/subscribe` rate-limited: 5 requests per IP per hour
- All security keys rotated April 26 2026 (post Vercel breach)
- First subscriber: nancywhite17@outlook.com (April 26 2026)

### Security Status (as of April 26 2026)
- Clerk on PRODUCTION instance — pk_live_ / sk_live_ keys
- All Supabase + Clerk + webhook keys rotated and marked Sensitive in Vercel
- Old dev keys deleted at source
- Bitwarden installed for password management
- Rate limiting on `/api/subscribe`
- Clerk webhook error rate was 83.3% on dev instance — new production webhook created,
  needs monitoring to confirm it's healthy

### What's NOT Built Yet
- Practice and Challenge tabs (pedagogy not finalised)
- User progress tracking (`lesson_sessions`, `question_attempts`)
- Migration 003 (community chat schema)
- Units 2–10 content
- Cosmetic redesign (warm, circular, spatial — approved but not started)
- CAPTCHA on subscribe form (Cloudflare Turnstile — next security layer)
- Email validation / double opt-in for subscribers
- Supabase RLS policy on `sruth_subscribers`

### Curriculum Structure
- 4 levels: Toiseachadh, Meadhanach, Adhartach, Fileanta
- 10 units per level
- 3 tabs per lesson: Learn, Practice, Challenge
- 5 flag figures: Scotland (F), Canada (M), USA (F), Australia (M), New Zealand (F)
- Spirals replace hearts as the lives/currency system
- Speech via Web Speech API is the core differentiator

### Design Direction (approved, not built)
- Kill the grey/corporate feel
- Warm, circular spatial language — the swirl is the UI logic
- Café bleeds into the lesson (no hard cut from photo to app)
- Circular level selector, slight arc/asymmetry
- Conversation feels spoken, not tabulated

### Immediate Priorities
1. Lock the pedagogy — lesson flow, question counts per level
2. Build Practice and Challenge tabs
3. Wire user progress tracking
4. Migration 003
5. Cosmetic pass (after structure is stable)
6. Add CAPTCHA to subscribe form (Cloudflare Turnstile)
7. Supabase RLS policy on sruth_subscribers
8. Confirm Clerk production webhook is healthy (was 83.3% error on dev)

### Key Files
```
app/layout.js                    Root layout with providers
app/page.js                      Coming soon page (JS hotspots, desktop+mobile images)
app/sruth/page.js                Sruth signup page (form, countdown timer)
app/(main)/home/page.js          Real GC home page (AileenVideo, hero, stats)
app/ionnsaich/page.js            Learn page
app/naidheachd/page.js           News page
app/tachartasan/page.js          Events page
app/coimhearsnachd/page.js       Community page
app/meadhanan/page.js            Media page
app/api/webhooks/clerk/route.js  Clerk → Supabase user sync webhook
app/api/subscribe/route.js       Sruth email signup (rate-limited, regex-validated)
components/LessonEngine.js       Interactive lesson player (core feature)
components/Navigation.js         Top nav
components/Footer.js             Footer
context/LanguageContext.js       EN/Gaelic toggle & translation system
lib/supabase.js                  Supabase client
middleware.js                    Clerk auth + access key gate (cookie-based)
supabase/rls_policies.sql        Row-level security policies
public/GC-Comingsoon_2.png           Coming soon desktop (1920×1080)
public/GC-Comingsoon_2_mobile.png    Coming soon mobile portrait (1080×1920)
public/sruth_sign_up_2.png           Sruth signup desktop (1920×1080)
public/sruth_sign_up_2_mobile.png    Sruth signup mobile portrait (1080×1920)
```

### Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
```

---

## PROJECT 2 — gc-app / Lorg na Càraidean (Expo Mobile App)

### What It Is
iOS/Android vocabulary matching game branded as **Lorg na Càraidean** ("Find the Pairs") under the
**Sgioba Ceilidh** team identity. Gaelic word pairs on a 4×4 card grid, landscape only. GC Kids
characters (Alba, U, Maple, GB, Awzi, Paddy, Nuwz, Siobhan, Piper, Sasha, Ruadh) rotate as tutors
by level. Designed around the Sniomh (swirl) motif. Codebase identifiers stay `gc-app`; only the
in-product brand and `app.json` display name carry the new game name.

### What's Built and Working
- 10 levels, all 4×4 grid (8 pairs), difficulty scales via flip speed + emoji hints + vocab unit
- Sniomh SVG spiral on card backs (SniomhCard component)
- Card flip animation (rotateY spring)
- Match celebration: cards spin 1260° (3.5 rotations) then back reveals background image portion
- Green → yellow → red phase system: 3 misses per phase, 1 swirl lost per exhausted phase
- 3 swirls total — lose all 3 = game over overlay
- Stone counter (🪨) tracks misses within current phase (visual only, resets on phase advance)
- Swirl counter (🌀) tracks lives (3 total, 1 lost per exhausted phase)
- Level select screen with GC Kids avatar (Alba), 10 tiles, lock/star system
- Level unlock: completing a level unlocks the next one (fixed Map.keys() bug)
- Blurred background image per level (different photo each level)
- GC Kids character rotates by level: 1=Alba, 2=U, 3=Maple, 4=GB, 5=Awzi, 6=Paddy, 7=Nuwz, 8=Alba, 9=U, 10=Maple
- Voice (expo-speech) removed — text bubbles only
- Sound effects fully wired: match, wrong, complete, gameover (.mp3 in assets/sounds/)
  - complete.mp3 / gameover.mp3: composed in Suno
  - match.mp3 / wrong.mp3: sourced from freesound.org
- Win sequence on level complete:
  1. All pairs matched → celebration spin (1800ms)
  2. Full background image shown fullscreen as prize (3500ms)
  3. GC-Kids Super Hero Landing.mp4 plays fullscreen (complete sound fires here)
  4. Score overlay: star rating + Play Again / ← Levels
- Vocab loads from Supabase for Unit 1; fallback vocab defined per unit in App.js
- All 5 vocab units defined in App.js UNIT_VOCAB

### Added 2026-05-02 (Lorg na Càraidean session)
- **In-product brand**: `app.json` display name → "Lorg na Càraidean" (slug remains `gc-app`)
- **Splash screen** on launch: `SgiobaCeilidh_LNC_Splash.png` fullscreen, tap-to-start advances to LevelSelect
- **Stone card backs** per phase (static PNGs, swapped from videos for performance):
  `green_card_static.png` / `yellow_card_static.png` / `red_card_static.png`.
  `SniomhCard` SVG remains as fallback only. Original `*_card.mp4` videos still on disk
  but no longer referenced — running 16 simultaneous `<Video>` instances on a 4×4 grid
  was too slow on phones.
- **Per-level win reveal system**: any level entry in `lib/levels.js` can set `revealImage` +
  `revealVideo` to override the default `level.bg` celebration and global `WIN_VIDEO`.
  Wired for levels 1, 2, 3. Naming convention: `level_N_reveal_image.png` + `level_N_reveal_video.mp4`
- **Custom card art** via `CARD_ASSETS` map in `components/MatchingGame.js` keyed by Gaelic word.
  Each pair has `dealbh` (picture side) + `facal` (word side). Lookup is exact-match on Gaelic
  string — accents matter (e.g. `'Cù'`, `'Bò'`, `'Càise'`)
  - **Unit 1 (animals/nature)**: all 8 pairs — Cù, Taigh, Bò, Cat, Eun, Iasg, Craobh, Muir
  - **Unit 2 (café)**: 6 of 8 — Cofaidh, Tì, Arán, Im, Bainne, Càise (missing Brot, Uisge)
  - **Unit 5 (landscape)**: 1 of 8 — Abhainn (Speur has typo'd dealbh `_dealabh.png` only)
- **Bug fixes**:
  - Added `Maple` to `SILHOUETTES` map (level 3 was silently falling back to Alba's silhouette)
  - Corrected U character path: `sammy.png` → `Sammy_1.png`
- **Character roster** expanded beyond original 7: Siobhan, Piper, Sasha, Ruadh added.
  In-game silhouette mapping now: Alba(1), U/Sammy(2), Maple(3), Awzi(4), Siobhan(5), Piper(6),
  GB1(7), Sasha(8), Nuwz(9), Ruadh(10)
- **File naming locked** for reveal assets: `level_N_reveal_image.png` + `level_N_reveal_video.mp4`
  (renamed all existing files to match)

### What's NOT Built Yet
- Vocab units 2–5 in Supabase (fallback hardcoded in App.js works fine for now)
- Win reveal image + video for levels 4–10
- Card art remaining:
  - Unit 2 — Brot, Uisge (dealbh + facal pairs)
  - Unit 3 (colours) — all 8 pairs
  - Unit 4 (family) — all 8 pairs
  - Unit 5 (landscape) — 7 remaining + fix Speur typo (`_dealabh` → `_dealbh`)
- PWA version for globalceilidh.com
- Web version (mobile-first was correct call)
- Replace `picsum.photos` URL on levels 3 & 4 `bg` field — only matters as fallback when `revealImage` isn't set on a level

### Key Files
```
App.js                         Root: splash → vocab loading → level select → game; UNIT_VOCAB
index.js                       Entry point (registerRootComponent)
app.json                       Expo config (orientation: landscape, name: "Lorg na Càraidean")
components/MatchingGame.js     Core game: flip cards, match logic, lives, phases, overlays, win sequence
                               + CARD_ASSETS map (per-Gaelic-word dealbh/facal art)
                               + PHASE_VIDEOS array (green/yellow/red card-back loops)
                               + per-level revealImage / revealVideo overrides
components/LevelSelect.js      Level picker: 10 tiles, lock/star, GC Kids bubble
components/SniomhCard.js       SVG Sniomh spiral — fallback for card backs only
lib/levels.js                  10 level definitions + CHARACTERS + SILHOUETTES maps
lib/supabase.js                Supabase client (requires react-native-url-polyfill)
lib/sounds.js                  expo-av sound effects (match, wrong, complete, gameover)
lib/speech.js                  expo-speech wrapper (kept but not used in game)

# Branding
assets/images/SgiobaCeilidh_LNC_Splash.png       In-app splash screen (tap to start)

# Stone card backs (static images by phase — videos retired for perf)
assets/images/green_card_static.png              Phase 0
assets/images/yellow_card_static.png             Phase 1
assets/images/red_card_static.png                Phase 2
# (original videos still on disk: green__card.mp4 / yellow_card.mp4 / red_card.mp4)

# Per-level win reveal (image + Pika video)
assets/images/level_{1,2,3}_reveal_image.png
assets/images/level_{1,2,3}_reveal_video.mp4

# Card art — keyed by Gaelic word in CARD_ASSETS (MatchingGame.js)
assets/images/{cu,taigh,bo,cat,eun,iasg,craobh,muir}_{dealbh,facal}.png   Unit 1 (full)
assets/images/{cofaidh,Ti,aran,im,bainne,caise}_dealbh.png + _facal.png   Unit 2 (6 of 8)
assets/images/abhainn_{dealbh,facal}.png                                  Unit 5 (1 of 8)

# Characters (CHARACTERS = portraits for LevelSelect; SILHOUETTES = in-game)
assets/images/{Alba,U,Maple,G.B.,Awzi,Paddy,Nuwz}.png                     Portraits
assets/images/{alba_1,Sammy_1,Maple_1,G.B._1,Awzi_1,siobhan_1,Piper_1,Sasha_1,ruadh_1}.png   Silhouettes (Nuwz silhouette TODO)

assets/images/GC-Kids Super Hero Landing.mp4    Default win video (fallback when no revealVideo)
assets/sounds/{match,wrong,complete,gameover}.mp3
```

### Game Mechanics Summary
- **Phase system**: 3 misses = 1 swirl lost + phase colour advances (Green→Yellow→Red). 3 swirls = 9 total misses before game over.
- **Stone counter**: visual only, resets on phase advance
- **Swirl counter**: 3 lives, 1 lost per exhausted phase
- **Celebration**: matched cards spin 1260° then back reveals bg image portion
- **Win sequence**: celebration → prize picture (3.5s) → win video → score overlay
- **roundKey**: increments on restart to force FlipCard remount (clears stale animation state)
- **Level unlock**: `Math.max(...completed.keys()) + 1` — completing level N unlocks N+1

### Vocabulary by Unit (App.js UNIT_VOCAB)
```
Unit 1: Cù, Taigh, Bò, Cat, Eun, Iasg, Craobh, Muir (animals/nature) — also loaded from Supabase
Unit 2: Cofaidh, Tì, Brot, Arán, Im, Bainne, Uisge, Càise (café food/drink)
Unit 3: Dearg, Gorm, Uaine, Buidhe, Geal, Dubh, Orains, Pinc (colours)
Unit 4: Athair, Màthair, Bràthair, Piuthar, Mac, Nighean, Bodach, Cailleach (family)
Unit 5: Grian, Gealach, Reul, Sneachda, Gaoth, Speur, Abhainn, Eilean (landscape/weather)
```

### Level → Vocab Unit Mapping
```
Levels 1–3:  Unit 1 (animals/nature)
Levels 4–5:  Unit 2 (café food/drink)
Levels 6–7:  Unit 3 (colours)
Levels 8–9:  Unit 4 (family)
Level 10:    Unit 5 (landscape/weather)
```

### Environment
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

---

## PROJECT 3 — sruth-backend (FastAPI)

### What It Is
Backend for the Sruth newsletter. Ingests Scottish Gaelic content from RSS feeds and
scraped sites, processes it with Claude, composes newsletters, and sends via Resend.
Tracks API costs per operation.

### What's Built and Working
- FastAPI with CORS, daily scheduled ingestion (APScheduler)
- Supabase PostgreSQL via SQLAlchemy
- RSS ingestion (feedparser) + Playwright web scraping
- Claude API integration for blurb generation and content refinement
- Newsletter HTML email template (V19): Fraunces + IBM Plex Mono, umber accent (#6B4E1F)
- Wordmark as hosted PNG (rendered via Puppeteer in sruth-admin, hosted on Supabase Storage)
- Story thumbnails (96×64px) in "The Current" section
- Resend API for email delivery
- Cost tracking: `sruth_costs` table, logs Anthropic + Resend costs per operation
- File upload endpoint: `POST /assets/upload` → Supabase Storage `assets/stories/`
- Costs summary endpoint: `GET /costs/summary`
- Celery + Redis/Upstash for async task queue

### Added 2026-05-03 (Scottish Gaelic STT — Phases 1 & 2)
- **EIST Edinburgh Whisper-large-v3-turbo Gaelic CT2 fine-tune** integrated via `faster-whisper`. CPU-safe defaults (Railway-friendly, no GPU assumed).
- **`app/services/stt_service.py`** — lazy-loaded `WhisperModel` singleton, `transcribe_audio_file()` returns `{text, language, model, duration_seconds, confidence}`. Reads `STT_*` env vars directly via `os.environ` (decoupled from `app.config.Settings`) so local testing doesn't require Supabase/Upstash/Anthropic keys.
- **`app/services/audio_ingest.py`** — `pick_audio_url(item)` walks `enclosure → media_url → url` with feedparser-shape coercion (string / dict / list); `transcribe_url()` does temp-file download via `httpx` + `asyncio.to_thread(...)` so the ingestion event loop isn't blocked.
- **`app/workers/ingestion.py`** — when an item has audio, the transcript is folded into `body_text` so the existing `classify_and_summarize()` pass picks it up. STT failures log `"STT failed …"` and the item ingests without a transcript (no schema change required).
- **`scripts/test_stt.py`** — local CLI: `python scripts/test_stt.py audio.mp3`. Auto-loads `.env` if `python-dotenv` is present.
- **Env vars added**: `STT_ENABLED` (default true), `STT_MODEL`, `STT_DEVICE` (default cpu), `STT_COMPUTE_TYPE` (default int8).
- **Deps added**: `faster-whisper==1.0.3`, `huggingface-hub==0.25.2`.
- **Gotcha**: `language="gd"` is rejected by faster-whisper (not in base Whisper language set). Auto-detect is safe because the EIST model is fine-tuned exclusively on Scottish Gaelic; output language is hardcoded to `"gd"`.

### What's NOT Built Yet
- Issue number auto-increment (currently hardcoded to 1)
- Story selection persistence in admin (navigating away loses selection)
- Several dead RSS source URLs (LearnGaelic, Speak Gaelic, Tobar an Dualchais, Kim Carnie, Julie Fowlis)
- Migration 003 (community chat schema — for global-ceilidh, not Sruth)
- **STT Phase 3**: FastAPI `POST /transcribe` (multipart audio + admin auth) so Cùilidh / GlobalCeilidh.com / gc-app can share one model deployment. ~half-day; not blocking Issue 1.
- Optional: dedicated `transcript_text` column on `sruth_raw_items` (currently folded into `body_text` — works, but loses audio-vs-text distinction for analytics)
- Railway: persistent volume mount at `~/.cache/huggingface/` so the EIST model isn't re-downloaded on every cold start

### Key Files
```
app/main.py                    FastAPI setup, CORS, scheduler, router registration
app/config.py                  Pydantic settings & env loading
app/database.py                Supabase PostgreSQL connection (SQLAlchemy)
app/redis_client.py            Upstash Redis client
app/models/newsletter.py       Newsletter model
app/models/newsletter_queue.py Queued newsletters
app/models/source.py           RSS/scrape source config
app/models/raw_item.py         Raw ingested items
app/models/website_queue.py    Website publishing queue
app/routers/brief.py           Morning brief generation (Claude)
app/routers/newsletter.py      Newsletter creation + Resend sending
app/routers/sources.py         Manage sources
app/routers/assets.py          Image upload (multipart → Supabase Storage) + costs summary
app/routers/auth.py            Admin auth (secret key)
app/llm/claude.py              Anthropic API calls
app/llm/costs.py               Token cost tracking (ANTHROPIC: $15/MTok in, $75/MTok out; RESEND: $0.0008/email)
app/scrapers/rss.py            RSS feed parsing
app/scrapers/playwright_scraper.py  Web scraping
app/workers/celery_app.py      Celery setup
app/workers/ingestion.py       Content fetch & ingest task
app/workers/processing.py      Content processing task
app/email/template.py          Email HTML builder (V19 — full inline CSS, PNG wordmark)
migrations/001_sruth_schema.sql  Initial schema
migrations/002_subscribers.sql   Subscriber tables
```

### Pricing Constants (app/llm/costs.py)
```python
ANTHROPIC_INPUT_PER_MTK  = 15.00   # per million tokens
ANTHROPIC_OUTPUT_PER_MTK = 75.00
RESEND_PER_EMAIL = 0.0008
```

### Environment Variables
```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
SUPABASE_URL
SUPABASE_SERVICE_KEY
ANTHROPIC_API_KEY
RESEND_API_KEY
ADMIN_SECRET
```

---

## PROJECT 4 — sruth-admin (Electron Desktop App)

### What It Is
Editorial dashboard for the Sruth newsletter. Runs locally (not deployed).
Used to compose morning briefs, build issues, manage sources, track costs.

### What's Built and Working
- Electron + React + Vite desktop app
- Sidebar navigation (Brief, Issue Builder, Sources, Subscribers, History, Costs)
- Morning brief editor (compose, preview, publish via Claude)
- Issue builder (select stories, arrange sections, preview)
- Source manager (add/edit/delete RSS feeds and scrapers)
- Subscriber list
- Cost tracking page: stat cards (total, by API), tables by operation + recent 30 calls
- Gaelic keyboard (floats bottom-right when text input focused)
  - 10 accented vowels: à è ì ò ù + uppercase
  - Uses onMouseDown + preventDefault to avoid stealing focus
- Story creation from scratch with file upload (not just URL)
- Wordmark PNG generator script (Puppeteer → Fraunces italic bold → crops to element)

### What's NOT Built Yet
- Issue number auto-increment (hardcoded)
- Story selection persistence when navigating back from Issue Builder

### Key Files
```
src/main/index.js              Electron main process (window, menu, devtools)
src/main/preload.js            IPC security bridge
src/renderer/App.jsx           Root router + sidebar
src/renderer/main.jsx          React entry
src/renderer/pages/Brief.jsx   Morning brief editor
src/renderer/pages/IssueBuilder.jsx  Newsletter issue builder
src/renderer/pages/Sources.jsx       Source management
src/renderer/pages/Subscribers.jsx   Subscriber list
src/renderer/pages/History.jsx       Published history + analytics
src/renderer/pages/Costs.jsx         API cost dashboard
src/renderer/components/GaelicKeyboard.jsx  Virtual Gaelic keyboard
src/renderer/api/client.js           HTTP client for backend calls
scripts/generate-wordmark.js         Puppeteer wordmark PNG generator
scripts/generate-icon.js             App icon builder (jimp)
vite.config.js                       Vite build config
```

### Environment (.env)
```
VITE_API_URL=http://localhost:8000
VITE_ADMIN_SECRET=...
```

---

## SHARED INFRASTRUCTURE

### Supabase Database (key tables)
```
immersion_locations     Lesson locations (e.g. cafaidh)
units                   Curriculum units per location/level
lesson_items            Vocabulary: gaelic, english, image_url, emoji, sort_order
lesson_sessions         User progress (not yet built)
question_attempts       Per-question tracking (not yet built)
sruth_newsletters       Newsletter records
sruth_sources           Content sources (RSS + scrapers)
sruth_raw_items         Ingested raw content
sruth_costs             API cost tracking per operation
```

### Aileen — The Character
- Scotland flag figure (red-haired woman)
- Source image: `C:\Users\Scott\Desktop\Aileen_2_CGPT_3_20.png`
- Used as: design consultant voice (conceptual) — no longer appears in gc-app
- gc-app now uses GC Kids characters (Alba, U, Maple, GB, Awzi, Paddy, Nuwz) rotating by level

### GC Kids Characters
- **11 characters total** (originally 7, expanded 2026-05): Alba, U, Maple, GB, Awzi, Paddy, Nuwz,
  Siobhan, Piper, Sasha, Ruadh
- Source images: `C:\Users\Scott\Desktop\GC-kids\`
- Two maps exported from `gc-app/lib/levels.js`:
  - `CHARACTERS` — full-color portraits (used by `LevelSelect`)
  - `SILHOUETTES` — silhouette / scene variants (used in-game by `MatchingGame`)
- In-game silhouette by level: Alba(1), U/Sammy(2), Maple(3), Awzi(4), Siobhan(5), Piper(6),
  GB1(7), Sasha(8), Nuwz(9), Ruadh(10)
- Text speech bubbles only (Gaelic + English) — voice removed

### The Sniomh (Swirl) Motif
- Core design language across all GlobalCeilidh products
- SVG spiral component: `gc-app/components/SniomhCard.js`
- Used as: card backs in matching game, life currency icon
- NOT Celtic knots — specifically the Sniomh spiral form

---

## PENDING ITEMS (cross-project)

### Cùilidh (personal Gaelic tutor — `C:\Dev\cuilidh`, not yet in source control / GitHub)
- [ ] **NEXT SESSION**: Build API cost meter — instrument all three Anthropic SDK calls in `src/main/index.js` (ingest-pdf, chat, end-session) to log token usage + cost (`$15/MTok in, $75/MTok out` for claude-opus-4-7) into a new `costs` array in electron-store. Add `get-costs` IPC handler + new **Costaisean / Costs** page mirroring `C:\Dev\sruth-admin\src\renderer\pages\Costs.jsx`. ~45-60 min.
- [ ] Push Cùilidh to GitHub at some point so remote agents become an option for it
- [ ] Add Cùilidh as PROJECT 5 in this master briefing (currently only documented in memory)

### Sruth
- [ ] Issue number auto-increment from sruth_newsletters table
- [ ] Story selection persistence in Issue Builder
- [ ] Fix dead RSS source URLs
- [ ] Run `sruth_costs` table SQL in Supabase if not done

### gc-app / Lorg na Càraidean
- [ ] Card art — Unit 2: Brot, Uisge (dealbh + facal)
- [ ] Card art — Unit 3 (colours): all 8 pairs
- [ ] Card art — Unit 4 (family): all 8 pairs
- [ ] Card art — Unit 5 (landscape): 7 remaining (rename Speur typo)
- [ ] Win reveal image + video for levels 4–10
- [ ] Seed Supabase with vocab units 2–5 (fallback hardcoded in App.js works for now)
- [ ] PWA for globalceilidh.com
- [ ] Web version of matching game
- [ ] Replace `picsum.photos` URL on levels 3 & 4 `bg` field (low priority — only matters if revealImage absent)

### global-ceilidh
- [ ] Lock pedagogy (question counts, lesson flow)
- [ ] Build Practice + Challenge tabs
- [ ] Wire user progress tracking
- [ ] Migration 003 (community chat)
- [ ] Cosmetic redesign pass
- [ ] CAPTCHA on subscribe form (Cloudflare Turnstile)
- [ ] Supabase RLS policy on sruth_subscribers table
- [ ] Confirm production Clerk webhook is healthy
- [ ] Clerk: complete "Setup social connection credentials" (0/1 in production instance)
