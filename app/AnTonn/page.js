// An Tonn — Magazine Cover
//
// Replaces the previous poster-paginated hub. The cover is editorial-led:
// hero photograph on the right, masthead + subtitle + Gàidhlig signature
// on the left, then the seven "explore" cards that map the publication.
//
// All the chart content (Top 10, Seven Currents, Tour Watch, Podcasts of
// the Month, Books, Coming Next Week) lives at /AnTonn/this-week, linked
// from the "View this week's charts →" CTA below the hero.

import Link from "next/link";
import AnTonnNav from "./_components/AnTonnNav";
import { issue } from "./data/week-2026-06-09";

export const metadata = {
  title: "An Tonn — The Chronicle of the Gaelic Current",
  description:
    "An Tonn (The Wave) is Sruth's weekly chronicle of Scottish and Gàidhlig music, books, podcasts, and the wider Gaelic current. Data. Context. Community.",
};

// ── Palette + type ────────────────────────────────────────────────────

const ACCENT = "#6B4E1F";
const ACCENT_LIGHT = "#C49100";
const INK = "#1A1A1A";
const PAPER = "#FCFCFC";
const PARCHMENT = "#F5F0E8";
const PARCHMENT_DEEP = "#EDE3D0";
const DIVIDER = "#E8DCC8";
const MUTED = "#8A8074";
const SERIF = "'Fraunces', Georgia, serif";
const DISPLAY = "'Cinzel', 'Fraunces', Georgia, serif";
const MONO = "'IBM Plex Mono', Menlo, Consolas, monospace";

const HERO_URL =
  "https://gakdrndravhtvaaimnhl.supabase.co/storage/v1/object/public/assets/antonn_hero.png";

// ── The seven explore cards ──────────────────────────────────────────

const CARDS = [
  {
    slug: "music",
    href: "/AnTonn/music",
    label: "Music Current",
    blurb: "Charts, currents, releases and tour watch.",
    accent: "#1A4FA0",
    Icon: GuitarIcon,
  },
  {
    slug: "books",
    href: "/AnTonn/books",
    label: "Books Current",
    blurb: "New releases, reviews and author spotlights.",
    accent: "#C49100",
    Icon: BookIcon,
  },
  {
    slug: "podcasts",
    href: "/AnTonn/podcasts",
    label: "Podcast Current",
    blurb: "Podcasts to listen to, learn from and be inspired by.",
    accent: "#5E3A91",
    Icon: MicIcon,
  },
  {
    slug: "film",
    href: "/AnTonn/film",
    label: "Film & TV Current",
    blurb: "Gaelic stories on screen and on the horizon.",
    accent: "#B83232",
    Icon: FilmIcon,
  },
  {
    slug: "radio",
    href: "/AnTonn/radio",
    label: "Radio · Coming Soon",
    blurb: "An Tonn Radio — Gaelic music 24/7.",
    accent: "#3E7B3E",
    Icon: BroadcastIcon,
  },
  {
    slug: "archive",
    href: "/AnTonn/archive",
    label: "Archive",
    blurb: "Past issues of An Tonn and deep dives.",
    accent: "#7A5230",
    Icon: ArchiveIcon,
  },
  {
    slug: "vote",
    href: "/AnTonn/vote",
    label: "Vote & Suggest",
    blurb: "Help shape next week's wave.",
    accent: "#D9700E",
    Icon: PeopleIcon,
  },
];

// ── Inline SVG icons (Lucide-inspired, single colour, no dependency) ──

function GuitarIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 4L13.5 10.5"/>
      <path d="M15 5l4 4"/>
      <circle cx="9.5" cy="14.5" r="4.5"/>
      <path d="M11 13l3-3"/>
    </svg>
  );
}
function BookIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
}
function MicIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  );
}
function FilmIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="18" rx="2"/>
      <line x1="7" y1="3" x2="7" y2="21"/>
      <line x1="17" y1="3" x2="17" y2="21"/>
      <line x1="2" y1="9" x2="22" y2="9"/>
      <line x1="2" y1="15" x2="22" y2="15"/>
    </svg>
  );
}
function BroadcastIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.9 19.1A10 10 0 0 1 4.9 4.9"/>
      <path d="M7.8 16.2a6 6 0 0 1 0-8.5"/>
      <circle cx="12" cy="12" r="2"/>
      <path d="M16.2 7.8a6 6 0 0 1 0 8.5"/>
      <path d="M19.1 4.9a10 10 0 0 1 0 14.2"/>
    </svg>
  );
}
function ArchiveIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="5" rx="1"/>
      <path d="M4 8v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  );
}
function PeopleIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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

// Dotted decoration that sits between the title and the tagline.
function DotRule() {
  return (
    <div
      aria-hidden="true"
      style={{
        margin: "14px 0 10px",
        height: 6,
        background:
          `radial-gradient(circle, ${ACCENT_LIGHT} 1.5px, transparent 2px) 0 50% / 14px 6px repeat-x`,
        width: 360,
        maxWidth: "60%",
      }}
    />
  );
}

// Small wavy divider used in the footer strip.
function WaveDivider({ width = 90, color = ACCENT_LIGHT }) {
  return (
    <svg
      width={width}
      height="10"
      viewBox="0 0 90 10"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <path
        d="M0 5 Q 7 0 14 5 T 28 5 T 42 5 T 56 5 T 70 5 T 84 5"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

// ── Sections ──────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      style={{
        position: "relative",
        background: PARCHMENT,
        overflow: "hidden",
      }}
    >
      {/* Hero photo — absolutely positioned to the right so it bleeds into
          the title space on the left at narrow widths, gradient-faded
          back into the parchment for readability. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "58%",
          height: "100%",
          backgroundImage: `url(${HERO_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "left center",
        }}
      />
      {/* Soft sepia-to-parchment fade from the left edge of the image so the
          text on the parchment side reads clean. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          width: "58%",
          height: "100%",
          background: `linear-gradient(90deg, ${PARCHMENT} 0%, rgba(245, 240, 232, 0.5) 18%, rgba(245, 240, 232, 0) 60%)`,
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: 1320,
          margin: "0 auto",
          padding: "28px 28px 56px",
        }}
      >
        {/* Issue stamp top-right */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 28,
            textAlign: "right",
            zIndex: 2,
          }}
        >
          <p
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: INK,
              margin: 0,
            }}
          >
            Issue
          </p>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 14,
              letterSpacing: 2,
              fontWeight: 700,
              color: ACCENT,
              margin: "4px 0 4px",
            }}
          >
            {issue.date_gd.toUpperCase()}
          </p>
          <div style={{ borderTop: `1px solid ${ACCENT}`, width: 100, marginLeft: "auto", marginBottom: 4 }} />
          <p
            style={{
              fontFamily: MONO,
              fontSize: 9,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: MUTED,
              margin: 0,
            }}
          >
            The Pilot Issue
          </p>
        </div>

        {/* Title + tagline column (left half) */}
        <div style={{ maxWidth: 640, position: "relative", zIndex: 1, paddingTop: 44 }}>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: "clamp(72px, 11vw, 152px)",
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
              margin: "0 0 24px",
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
              maxWidth: 560,
            }}
          >
            Your weekly guide to the artists, songs, books, voices and stories that carry
            Gaelic culture forward.
          </p>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 16,
              fontWeight: 700,
              color: INK,
              margin: "0 0 22px",
              letterSpacing: 0.5,
            }}
          >
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
          <div>
            <StarIcon size={28} />
          </div>
          <div>
            <p
              style={{
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: 3,
                textTransform: "uppercase",
                color: INK,
                margin: 0,
                fontWeight: 700,
              }}
            >
              The Gaelic Current This Week
            </p>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: 14,
                color: MUTED,
                margin: "4px 0 0",
              }}
            >
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
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14,
          }}
        >
          {CARDS.map((c) => {
            const Icon = c.Icon;
            return (
              <Link
                key={c.slug}
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
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: INK,
                    margin: "0 0 14px",
                    flex: 1,
                  }}
                >
                  {c.blurb}
                </p>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: c.accent,
                    fontWeight: 700,
                  }}
                >
                  Explore &nbsp;→
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        background: PARCHMENT,
        borderTop: `1px solid ${DIVIDER}`,
        padding: "20px 28px",
      }}
    >
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
        <p
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: MUTED,
            margin: 0,
          }}
        >
          Daily &nbsp;·&nbsp; From Global Ceilidh &nbsp;·&nbsp; Since 2026
        </p>
        <WaveDivider />
        <p
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: MUTED,
            margin: 0,
            textAlign: "right",
          }}
        >
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
