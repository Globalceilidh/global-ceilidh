# GlobalCeilidh — Social Platform Architecture

_Spec for the "Facebook for Gaels" build: profiles, group/org pages, posts,
follows, video, and moderation. Decisions locked 2026-07-15. Build against this._

---

## 0. The two content channels (don't conflate them)

GC has **two** content models that look similar but are architecturally distinct:

1. **Editorial / curated** — An Tonn Bhidio, the Radio station. Content passes a
   **review queue** and lands on GC's *branded shared walls*. GC as **publisher**.
   _Already built: the `/contribute` submissions pipeline → `gc_submissions` → `gc_videos`._

2. **Social / personal** — a user's or group's **own page + wall**. They post to
   *their own space*; it shows on their page and in followers' feeds. GC as
   **platform**. _This document specifies channel 2._

Same upload can target either destination ("post to my wall" vs "submit to An Tonn").

---

## 1. Identity & pages

| Entity | Route | Backed by |
|---|---|---|
| Personal page ("Cèilidh") | `/u/<handle>` | `gc_profiles` (1:1 with Clerk user) |
| Group / business page | `/g/<handle>` | `gc_orgs` + Clerk Organization |

- **Handle** = unique, URL-safe, user-chosen. Reserve a blocklist (admin, api, etc.).
- Page = header (photo, name, location, Gàidhlig level, bio, Follow button) + a
  tabbed wall (Posts / Videos / Music / About) + a composer visible only to owners/admins.

---

## 2. Data model

### `gc_profiles` (personal identity + page)
```
id                UUID PK
clerk_user_id     TEXT UNIQUE NOT NULL      -- FK to Clerk user
handle            TEXT UNIQUE NOT NULL
display_name      TEXT
avatar_url        TEXT
region            TEXT                       -- coarse diaspora location, never exact address
lat, lng          NUMERIC                    -- optional, opt-in, coarsened for the globe
location_public   BOOLEAN DEFAULT FALSE      -- gate for appearing on the saoghal
ancestral_places  TEXT[]
gaidhlig_level    TEXT
bio               TEXT
interests         TEXT[]
clan_family_names TEXT[]
trust_tier        TEXT DEFAULT 'new'         -- 'new' | 'established' | 'verified'
created_at, updated_at
```
Seed a row from the Clerk→Supabase webhook on user creation.

### `gc_orgs` (group / business page)
```
id            UUID PK
clerk_org_id  TEXT UNIQUE                    -- Clerk Organization id (for ROLES only)
handle        TEXT UNIQUE NOT NULL
name          TEXT NOT NULL
kind          TEXT                            -- 'society' | 'business' | 'band' | 'school' | ...
avatar_url, banner_url, region, bio
is_verified   BOOLEAN DEFAULT FALSE
video_max_seconds INT DEFAULT 1800            -- higher cap than personal
created_at, updated_at
```

### `gc_org_members` (WHO RUNS the group — roles) — the small set
```
id, org_id FK, clerk_user_id, role ('admin'|'moderator'|'member'), created_at
```
Model **only the people who administer/moderate** the org here — mirrors the Clerk
Organization membership. Handful of people. Free Clerk tier is fine.

### `gc_follows` (WHO CONNECTS TO a page) — the big set
```
id, follower_clerk_user_id, target_type ('profile'|'org'), target_id, created_at
UNIQUE (follower_clerk_user_id, target_type, target_id)
```
**This is where "2,000 users connect to Slighe" lives.** One tiny row per connection.
Unlimited, free, instant. **NEVER model followers as Clerk Org members** — that hits
the 20-member free cap and forces the $100/mo B2B add-on. Followers = your DB. Clerk
Orgs = only the admins/mods in `gc_org_members`.

### `gc_posts` (the wall — personal AND org)
```
id            UUID PK
author_type   TEXT   -- 'profile' | 'org'
author_id     UUID   -- gc_profiles.id or gc_orgs.id
kind          TEXT   -- 'text' | 'image' | 'video' | 'audio'
body          TEXT
media_url     TEXT   -- image/audio URL, or video player URL
youtube_id    TEXT   -- for embedded video
video_provider TEXT  -- 'youtube' | 'stream' | 'mux'
video_uid     TEXT   -- managed-platform asset id
poster_url    TEXT
mod_status    TEXT DEFAULT 'pending'  -- 'pending' | 'live' | 'removed'
created_at
```

### `gc_reports` (user reporting — the backstop layer)
```
id, post_id FK, reporter_clerk_user_id, reason, notes, status
('open'|'actioned'|'dismissed'), created_at
```

---

## 3. Video pipeline — never self-host raw files at scale

Raw files in Supabase + your own player = no transcoding, huge bandwidth, clips that
won't play. **Hybrid model:**

- **YouTube link** — for anyone with a channel. Store `youtube_id`. Free.
- **Direct upload → managed streaming** (**Cloudflare Stream** / **Mux** / **Bunny
  Stream**). Platform transcodes to adaptive HLS, hosts, CDN-delivers, returns a player
  + thumbnail. Cost ≈ per-minute stored + per-minute delivered (verify current pricing).

This keeps GC's own storage/bandwidth flat regardless of user count.

### Length caps by trust tier
| Account | Cap |
|---|---|
| Personal (new/established) | 3–5 min |
| Verified group/org | 15–30 min (`gc_orgs.video_max_seconds`) |
| Hard file-size backstop | ~500 MB |

---

## 4. Moderation — layered; manual queue does NOT scale

Human review (the `/contribute` queue) is right for low volume only. At scale, layer:

1. **CSAM scanning — mandatory, non-negotiable, day one of hosting UGC media.**
   Cloudflare CSAM Scanning / PhotoDNA / Thorn Safer. Legal requirement.
2. **AI content classification** (Hive / AWS Rekognition / Google Video Intelligence) —
   auto-approve clearly-clean, auto-block clearly-bad, route the uncertain middle to a human.
3. **Trust tiers** (`gc_profiles.trust_tier`) — verified orgs & established users
   **post-moderate** (live immediately, removable on flag); new/anonymous accounts
   **pre-moderate** (held). Cuts the human queue ~90%.
4. **Delegated moderation** — group admins/mods moderate their *own* group's content.
5. **User reporting** (`gc_reports`) — the last backstop, NOT the primary defense.

**Rule: reporting-only is not acceptable.** Bad content would be visible before it's
caught, and for CSAM that's legal exposure. Reporting is layer 5.

### Legal / compliance checklist (before public UGC launch)
- [ ] CSAM scanning wired
- [ ] DMCA takedown flow + registered agent
- [ ] DSA compliance for EU users (complaint handling, transparency)
- [ ] ToS + Privacy Policy that actually cover UGC
- [ ] Block / report / harassment tooling
- [ ] Delegated group-admin moderation tools

---

## 5. Feed

- **Now (≤ ~10k):** fan-out-on-read — "recent `gc_posts` from profiles/orgs I follow,
  where `mod_status='live'`, ordered by `created_at`." Trivial at 2k.
- **Later (100k+ followers on a single page):** materialize / cache feeds, hybrid
  fan-out. Not a concern until celebrity-scale.

---

## 6. Scaling thresholds (infra)

| Scale | Changes |
|---|---|
| Now → ~2,000 | Supabase Pro (~$25/mo), paid Resend, Clerk free. Media on YouTube/Stream/Live365. No code re-arch. ~$50–75/mo. |
| ~10,000 | Clerk Pro; media on CDN/streaming platform; Postgres connection pooler; start feed caching. |
| ~50,000+ | Decouple APScheduler from the API into its own worker (the one true architectural ceiling — backend is single-instance because the scheduler runs in-process); materialized feeds; read replica. |

Binding constraint is **usage pattern, not headcount** — keep video off your own storage
and 2k is boring.

---

## 7. Build order

1. `gc_profiles` + webhook seed + `/u/<handle>` page shell _(was "move 2")_
2. `gc_posts` + composer (text → image → video-via-YouTube → audio)
3. `gc_follows` + fan-out-on-read feed ("An Sruth")
4. `gc_orgs` + `gc_org_members` (Clerk Orgs for roles) + `/g/<handle>` org pages
5. Managed video upload (Cloudflare Stream/Mux) + length caps
6. Moderation stack: CSAM + AI classify + trust tiers + delegated mod + `gc_reports`
7. Globe "you are here" + nearby people/pages (needs `gc_profiles.location_public`)
