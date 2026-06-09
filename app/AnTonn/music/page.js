// /AnTonn/music — Ceòl section opener, real webpage matching the mockup.
//
// Built parallel to the cover: real CSS chrome rendering the title block,
// the "Gaelic Sound, Everywhere" callout, and the six explore cards.
// The hero photograph uses the supplied Ceòl mockup PNG, cropped via
// background-size + position so only the loch + guitar imagery shows.
// The six cards all route into /AnTonn/this-week (the live chart issue)
// for now; each can have its own sub-page later.

import Link from "next/link";
import AnTonnNav from "../_components/AnTonnNav";

export const metadata = {
  title: "An Tonn — Ceòl · Music",
  description:
    "An Tonn's music vertical — the Top 10, the Seven Currents, releases, artist profiles, tracks to hear, and tour watch shaping the global Gaelic music current.",
};

const ACCENT = "#6B4E1F";
const ACCENT_LIGHT = "#C49100";
const INK = "#1A1A1A";
const PAPER = "#FCFCFC";
const PARCHMENT = "#F5F0E8";
const DIVIDER = "#E8DCC8";
const MUTED = "#8A8074";
const SERIF = "'Fraunces', Georgia, serif";
const DISPLAY = "'Cinzel', 'Fraunces', Georgia, serif";
const MONO = "'IBM Plex Mono', Menlo, Consolas, monospace";

const HERO_IMAGE_URL =
  "https://gakdrndravhtvaaimnhl.supabase.co/storage/v1/object/public/assets/antonn_music_hero.png";

// ── Inline SVG icons for the six cards ────────────────────────────────

function ChartIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
function ReleasesIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function ProfileIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function TracksIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  );
}
function TourIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function VideoIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  );
}
function StarIcon({ size = 22, color = ACCENT_LIGHT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

const CARDS = [
  { href: "/AnTonn/this-week", label: "Charts & Currents",  blurb: "Top 10 overall and the seven currents shaping the scene this week.", accent: "#1A4FA0", Icon: ChartIcon },
  { href: "/AnTonn/this-week", label: "New Releases",       blurb: "Albums, EPs and singles fresh from across the world.",              accent: "#C49100", Icon: ReleasesIcon },
  { href: "/AnTonn/this-week", label: "Artist Profiles",    blurb: "In-depth features on the artists behind the music.",                 accent: "#5E3A91", Icon: ProfileIcon },
  { href: "/AnTonn/this-week", label: "Tracks To Hear",     blurb: "Essential tracks, playlists and hidden gems.",                       accent: "#B83232", Icon: TracksIcon },
  { href: "/AnTonn/this-week", label: "Tour Watch",         blurb: "Who's on the road and where the music will take you.",               accent: "#3E7B3E", Icon: TourIcon },
  { href: "/AnTonn/this-week", label: "Live & Video",       blurb: "Live sessions, performances and music videos.",                      accent: "#D9700E", Icon: VideoIcon },
];

function DotRule() {
  return (
    <div
      aria-hidden="true"
      style={{
        margin: "12px 0 14px",
        height: 6,
        background: `radial-gradient(circle, ${ACCENT_LIGHT} 1.5px, transparent 2px) 0 50% / 14px 6px repeat-x`,
        width: 380,
        maxWidth: "80%",
      }}
    />
  );
}

function WaveDivider({ width = 90 }) {
  return (
    <svg width={width} height="10" viewBox="0 0 90 10" aria-hidden="true" style={{ display: "block" }}>
      <path d="M0 5 Q 7 0 14 5 T 28 5 T 42 5 T 56 5 T 70 5 T 84 5" stroke={ACCENT_LIGHT} strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

function Hero() {
  return (
    <section style={{ background: PARCHMENT, position: "relative" }}>
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 5fr) minmax(0, 6fr)",
          gap: 0,
          alignItems: "stretch",
          minHeight: 480,
        }}
      >
        <div style={{ padding: "44px 28px 56px" }}>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: "clamp(64px, 9.5vw, 132px)",
              letterSpacing: "0.04em",
              lineHeight: 0.92,
              margin: 0,
              color: INK,
            }}
          >
            CEÒL
          </h1>
          <DotRule />
          <p style={{ fontFamily: MONO, fontSize: 13, letterSpacing: 4, textTransform: "uppercase", color: ACCENT, margin: "0 0 26px" }}>
            The Music of the Gaelic Current
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: INK, margin: "0 0 14px", maxWidth: 540 }}>
            From ancient song to modern stages. Explore the artists, albums, tracks and stories moving the Gaelic world.
          </p>
          <p
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 17,
              color: ACCENT,
              margin: 0,
              display: "inline-block",
              borderBottom: `2px wavy ${ACCENT_LIGHT}`,
              paddingBottom: 4,
            }}
          >
            Bho sheann òran gu fuaim ùr.
          </p>
        </div>

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: 480,
            backgroundImage: `url(${HERO_IMAGE_URL})`,
            backgroundSize: "auto 175%",
            backgroundPosition: "right -20%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(90deg, ${PARCHMENT} 0%, rgba(245,240,232,0.5) 8%, rgba(245,240,232,0) 25%)`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

function ChartsCalloutStrip() {
  return (
    <section style={{ background: PARCHMENT, padding: "0 28px 26px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <Link
          href="/AnTonn/this-week"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: 24,
            alignItems: "center",
            background: PAPER,
            border: `1px solid ${DIVIDER}`,
            borderRadius: 8,
            padding: "22px 26px",
            textDecoration: "none",
          }}
        >
          <StarIcon size={28} />
          <div>
            <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: INK, margin: 0, fontWeight: 700 }}>
              The Gaelic Sound, Everywhere
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 14, color: MUTED, margin: "4px 0 0" }}>
              Charts, currents, releases, features and the voices driving our music forward.
            </p>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: ACCENT, fontWeight: 700, whiteSpace: "nowrap" }}>
            View this week's music charts &nbsp;→
          </div>
        </Link>
      </div>
    </section>
  );
}

function CardGrid() {
  return (
    <section style={{ background: PARCHMENT, padding: "0 28px 56px" }}>
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
        }}
      >
        {CARDS.map((c) => {
          const Icon = c.Icon;
          return (
            <Link
              key={c.label}
              href={c.href}
              style={{
                display: "flex",
                flexDirection: "column",
                background: PAPER,
                border: `1px solid ${DIVIDER}`,
                borderRadius: 8,
                padding: "20px 18px",
                textDecoration: "none",
                minHeight: 200,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: c.accent,
                  color: "#FCFCFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <Icon />
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: c.accent, fontWeight: 700, lineHeight: 1.25, marginBottom: 8 }}>
                {c.label}
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.5, color: INK, margin: "0 0 14px", flex: 1 }}>
                {c.blurb}
              </p>
              <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: c.accent, fontWeight: 700 }}>
                Explore &nbsp;→
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: PARCHMENT, borderTop: `1px solid ${DIVIDER}`, padding: "20px 28px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 24, alignItems: "center" }}>
        <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: MUTED, margin: 0 }}>
          Daily &nbsp;·&nbsp; From Global Ceilidh &nbsp;·&nbsp; Since 2026
        </p>
        <WaveDivider />
        <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: MUTED, margin: 0, textAlign: "right" }}>
          Tìr Nan Gàidheal. Everywhere.
        </p>
      </div>
    </footer>
  );
}

export default function AnTonnMusic() {
  return (
    <main style={{ background: PARCHMENT, minHeight: "100vh" }}>
      <AnTonnNav activeSlug="Music" />
      <Hero />
      <ChartsCalloutStrip />
      <CardGrid />
      <Footer />
    </main>
  );
}
