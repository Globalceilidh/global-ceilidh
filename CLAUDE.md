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
- Clerk auth with webhook route at `/api/webhooks/clerk`
- LessonEngine connected to Supabase — pulling live phrases, phonetics, grammar notes
  for Unit 1 / An Cafaidh / Toiseachadh level
- Learn tab working end to end
- Vercel deployed, analytics live

### What's NOT Built Yet
- Practice and Challenge tabs (pedagogy not finalised)
- User progress tracking (`lesson_sessions`, `question_attempts`)
- Migration 003 (community chat schema)
- Units 2–10 content
- Cosmetic redesign (warm, circular, spatial — approved but not started)

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

### Key Files
```
app/layout.js                  Root layout with providers
app/page.js                    Homepage
app/ionnsaich/page.js          Learn page
app/naidheachd/page.js         News page
app/tachartasan/page.js        Events page
app/coimhearsnachd/page.js     Community page
app/meadhanan/page.js          Media page
app/api/webhooks/clerk/route.js  Clerk → Supabase user sync webhook
components/LessonEngine.js     Interactive lesson player (core feature)
components/Navigation.js       Top nav
components/Footer.js           Footer
context/LanguageContext.js     EN/Gaelic toggle & translation system
lib/supabase.js                Supabase client
middleware.js                  Clerk auth middleware
supabase/rls_policies.sql      Row-level security policies
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

## PROJECT 2 — gc-app (Expo Mobile App)

### What It Is
iOS/Android vocabulary matching game — Gaelic word pairs on a 4×4 card grid.
Landscape only. Aileen (Scotland flag figure, red-haired woman) is the tutor character.
Designed around the Sniomh (swirl) motif.

### What's Built and Working
- 10 levels, all 4×4 grid (8 pairs), difficulty scales via flip speed + emoji hints + vocab unit
- Sniomh SVG spiral on card backs (SniomhCard component)
- Card flip animation (rotateY spring)
- Match celebration: cards spin 3 full rotations then reveal background image portion
- Green → yellow → red phase system: 3 misses per phase, 1 swirl lost per exhausted phase
- 3 swirls total — lose all 3 = game over overlay
- Stone counter (🪨) tracks misses within current phase (depletes 3→2→1→0)
- Swirl counter (🌀) tracks lives (depletes 3→2→1→0)
- Level select screen with Aileen avatar, 10 tiles, lock/star system
- Blurred background image per level (different photo each level)
- Aileen speaks feedback phrases via expo-speech (Scottish Gaelic `gd` language code)
- Tap Aileen to repeat her current phrase
- expo-av wired for game sound effects (needs .mp3 files in assets/sounds/)
- Vocab loads from Supabase for Unit 1; fallback vocab defined per unit in App.js
- Level completion overlay with star rating + Play Again / ← Levels buttons
- vocab units 1 (animals/nature), 2 (café drinks/food), 3 (colours) defined in App.js

### What's NOT Built Yet
- Game sound effect .mp3 files (infrastructure ready in lib/sounds.js)
- Vocab units 4–10 in Supabase
- PWA version for globalceilidh.com
- Web version (mobile-first was correct call)

### Key Files
```
App.js                         Root: vocab loading, level select, screen routing
index.js                       Entry point (registerRootComponent)
app.json                       Expo config (orientation: landscape)
components/MatchingGame.js     Core game: flip cards, match logic, lives, phases, overlays
components/LevelSelect.js      Level picker: 10 tiles, lock/star, Aileen bubble
components/SniomhCard.js       SVG Sniomh spiral for card backs
lib/levels.js                  10 level definitions (flipDelay, showEmoji, vocabUnit, bg image)
lib/supabase.js                Supabase client (requires react-native-url-polyfill)
lib/sounds.js                  expo-av sound effect stubs (uncomment when .mp3s added)
lib/speech.js                  expo-speech wrapper (speakGaelic, stopSpeech)
assets/images/aileen.png       Aileen character avatar
```

### Game Mechanics Summary
- **Phase system**: Green (3 free misses) → Yellow (3 free misses) → Red (3 misses, 1 swirl lost)
  Wait — corrected: EACH phase costs 1 swirl after 3 misses. 9 total misses = game over.
- **Stone counter**: depletes within current phase (visual only, resets on phase advance)
- **Swirl counter**: 3 lives, 1 lost per exhausted phase
- **Celebration**: on match, cards spin 1260° (3.5 rotations) then back reveals background image
- **roundKey**: increments on restart to force FlipCard remount (clears stale animation state)

### Vocabulary by Unit (App.js UNIT_VOCAB)
```
Unit 1: Cù, Taigh, Bò, Cat, Eun, Iasg, Craobh, Muir (animals/nature) — also loaded from Supabase
Unit 2: Cofaidh, Tì, Brot, Arán, Im, Bainne, Uisge, Càise (café food/drink)
Unit 3: Dearg, Gorm, Uaine, Buidhe, Geal, Dubh, Orains, Pinc (colours)
Units 4–5: fall back to Unit 1 until Supabase content seeded
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

### What's NOT Built Yet
- Issue number auto-increment (currently hardcoded to 1)
- Story selection persistence in admin (navigating away loses selection)
- Several dead RSS source URLs (LearnGaelic, Speak Gaelic, Tobar an Dualchais, Kim Carnie, Julie Fowlis)
- Migration 003 (community chat schema — for global-ceilidh, not Sruth)

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
- Used as: game tutor (gc-app), design consultant voice (conceptual)
- In gc-app: speaks feedback via expo-speech (language: 'gd'), tappable to repeat
- Speech bubble phrases in both Gaelic and English

### The Sniomh (Swirl) Motif
- Core design language across all GlobalCeilidh products
- SVG spiral component: `gc-app/components/SniomhCard.js`
- Used as: card backs in matching game, life currency icon
- NOT Celtic knots — specifically the Sniomh spiral form

---

## PENDING ITEMS (cross-project)

### Sruth
- [ ] Issue number auto-increment from sruth_newsletters table
- [ ] Story selection persistence in Issue Builder
- [ ] Fix dead RSS source URLs
- [ ] Run `sruth_costs` table SQL in Supabase if not done

### gc-app
- [ ] Add .mp3 sound files to assets/sounds/ (match, wrong, complete, gameover)
  Sources: freesound.org, mixkit.co/free-sound-effects
- [ ] Seed Supabase with vocab units 2–5
- [ ] PWA for globalceilidh.com
- [ ] Web version of matching game

### global-ceilidh
- [ ] Lock pedagogy (question counts, lesson flow)
- [ ] Build Practice + Challenge tabs
- [ ] Wire user progress tracking
- [ ] Migration 003 (community chat)
- [ ] Cosmetic redesign pass
