// /AnTonn — magazine cover, built as a real webpage matching the mockup.
//
// Everything visible on the design (sruth wordmark, top nav, social icons,
// title block, hero photograph, "This Week" callout, seven explore cards,
// footer) is rendered as real components with real links. The hero
// photograph uses the supplied mockup image cropped to show only the
// wave area — the title and nav from the mockup never visually appear
// because the surrounding chrome lives in CSS.

import Link from "next/link";
import AnTonnNav from "./_components/AnTonnNav";
import { issue } from "./data/week-2026-06-09";

export const metadata = {
  title: "An Tonn — The Chronicle of the Gaelic Current",
  description:
    "An Tonn (The Wave) is Sruth's weekly chronicle of Scottish and Gàidhlig music, books, podcasts, and the wider Gaelic current. Data. Context. Community.",
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

// Same Supabase storage path as the mockup we use for the hero photograph.
// CSS positioning crops it to the wave portion only — no title or nav
// visually overlaps with the rendered chrome.
const HERO_IMAGE_URL =
  "https://gakdrndravhtvaaimnhl.supabase.co/storage/v1/object/public/assets/antonn_hero.png";

// ── Inline SVG icons for the seven cards ─────────────────────────────

function GuitarIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 4L13.5 10.5"/><path d="M15 5l4 4"/><circle cx="9.5" cy="14.5" r="4.5"/><path d="M11 13l3-3"/>
    </svg>
  );
}
function BookIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
}
function MicIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  );
}
function FilmIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="18" rx="2"/><line x1="7" y1="3" x2="7" y2="21"/><line x1="17" y1="3" x2="17" y2="21"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="2" y1="15" x2="22" y2="15"/>
    </svg>
  );
}
function BroadcastIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.9 19.1A10 10 0 0 1 4.9 4.9"/><path d="M7.8 16.2a6 6 0 0 1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.5"/><path d="M19.1 4.9a10 10 0 0 1 0 14.2"/>
    </svg>
  );
}
function ArchiveIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8"/><line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  );
}
function PeopleIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
  { href: "/AnTonn/music",      label: "Music Current",   blurb: "Charts, currents, releases and tour watch.",                accent: "#1A4FA0", Icon: GuitarIcon },
  { href: "/AnTonn/books",      label: "Books Current",   blurb: "New releases, reviews and author spotlights.",              accent: "#C49100", Icon: BookIcon },
  { href: "/AnTonn/podcasts",   label: "Podcast Current", blurb: "Podcasts to listen to, learn from and be inspired by.",     accent: "#5E3A91", Icon: MicIcon },
  { href: "/AnTonn/film",       label: "Film & TV Current", blurb: "Gaelic stories on screen and on the horizon.",            accent: "#B83232", Icon: FilmIcon },
  { href: "/AnTonn/radio",      label: "Radio · Coming Soon", blurb: "An Tonn Radio — Gaelic music 24/7.",                    accent: "#3E7B3E", Icon: BroadcastIcon },
  { href: "/AnTonn/archive",    label: "Archive",         blurb: "Past issues of An Tonn and deep dives.",                    accent: "#7A5230", Icon: ArchiveIcon },
  { href: "/AnTonn/vote",       label: "Vote & Suggest",  blurb: "Help shape next week's wave.",                              accent: "#D9700E", Icon: PeopleIcon },
];

// ── Dotted underline beneath the title ───────────────────────────────

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

// ── Sections ─────────────────────────────────────────────────────────

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
        {/* LEFT — title + tagline, parchment */}
        <div style={{ padding: "44px 28px 56px", position: "relative" }}>
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
            AN TONN
          </h1>
          <DotRule />
          <p
            style={{
              fontFamily: MONO,
              fontSize: 13,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: ACCENT,
              margin: "0 0 26px",
            }}
          >
            The Chronicle of the Gaelic Current
          </p>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 17,
              lineHeight: 1.6,
              color: INK,
              margin: "0 0 14px",
              maxWidth: 540,
            }}
          >
            Your weekly guide to the artists, songs, books, voices and stories that carry Gaelic culture forward.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: INK, margin: "0 0 22px" }}>
            Data. Context. Community.
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
            'S e an t-tonn a tha nar giùlan.
          </p>
        </div>

        {/* RIGHT — hero photograph. The mockup PNG is used as a background
            image, scaled up and right-anchored so only the wave portion
            shows (the title/nav baked into the left side of the mockup
            never enters the visible region). */}
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
          {/* Soft left-edge gradient blends the image into the parchment
              on the left so the boundary doesn't read as a hard seam. */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(90deg, ${PARCHMENT} 0%, rgba(245,240,232,0.5) 8%, rgba(245,240,232,0) 25%)`,
            }}
          />
          {/* Issue stamp top-right */}
          <div
            style={{
              position: "absolute",
              top: 22,
              right: 28,
              textAlign: "right",
              color: INK,
              background: "rgba(245,240,232,0.85)",
              padding: "8px 12px",
              borderRadius: 4,
            }}
          >
            <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: INK, margin: 0 }}>
              Issue
            </p>
            <p style={{ fontFamily: MONO, fontSize: 14, letterSpacing: 2, fontWeight: 700, color: ACCENT, margin: "4px 0 4px" }}>
              {issue.date_gd.toUpperCase()}
            </p>
            <div style={{ borderTop: `1px solid ${ACCENT}`, width: 100, marginLeft: "auto", marginBottom: 4 }} />
            <p style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: MUTED, margin: 0 }}>
              The Pilot Issue
            </p>
          </div>
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
              The Gaelic Current This Week
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 14, color: MUTED, margin: "4px 0 0" }}>
              The Top 10 artists and the seven currents shaping our global community.
            </p>
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: ACCENT,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            View this week's charts &nbsp;→
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
              key={c.href + c.label}
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
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: 2.5,
                  textTransform: "uppercase",
                  color: c.accent,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  marginBottom: 8,
                }}
              >
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
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          gap: 24,
          alignItems: "center",
        }}
      >
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

export default function AnTonnCover() {
  return (
    <main style={{ background: PARCHMENT, minHeight: "100vh" }}>
      <AnTonnNav activeSlug="An Tonn" />
      <Hero />
      <ChartsCalloutStrip />
      <CardGrid />
      <Footer />
    </main>
  );
}
