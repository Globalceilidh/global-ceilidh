// /AnTonn/music — Ceòl vertical.
//
// Replaces the bare ComingSoon placeholder with a proper section opener:
// the Ceòl hero image as the visual anchor, the bilingual title above,
// and the editorial promise for what the vertical will hold below.
// Issue 002 (16 June) is when the deep music coverage opens.

import Link from "next/link";
import AnTonnNav from "../_components/AnTonnNav";

export const metadata = {
  title: "An Tonn — Ceòl · Music",
  description:
    "An Tonn's music vertical — Spotify links, tour calendars, releases, and the full Top 50. Opening with Issue 002 on 16 June 2026.",
};

const ACCENT = "#6B4E1F";
const INK = "#1A1A1A";
const PAPER = "#FCFCFC";
const PARCHMENT = "#F5F0E8";
const DIVIDER = "#E8DCC8";
const MUTED = "#8A8074";
const SERIF = "'Fraunces', Georgia, serif";
const DISPLAY = "'Cinzel', 'Fraunces', Georgia, serif";
const MONO = "'IBM Plex Mono', Menlo, Consolas, monospace";

const MUSIC_HERO_URL =
  "https://gakdrndravhtvaaimnhl.supabase.co/storage/v1/object/public/assets/antonn_music_hero.png";

function Hero() {
  return (
    <section style={{ background: PARCHMENT, padding: 0 }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "20px 28px 0" }}>
        {/* Hero photograph — full width inside the page gutters. */}
        <div
          style={{
            width: "100%",
            aspectRatio: "16 / 7",
            background: `url(${MUSIC_HERO_URL}) center / cover no-repeat`,
            borderRadius: 6,
            position: "relative",
            overflow: "hidden",
            minHeight: 280,
          }}
        >
          {/* Soft gradient tint at the bottom so the title plate reads
              cleanly even when content sits flush. */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.25) 100%)",
            }}
          />
        </div>
      </div>

      {/* Title block — sits below the hero photograph, parchment background
          so the bilingual title and the description read as continuous
          editorial type rather than overlay text. */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 28px 12px", textAlign: "center" }}>
        <p
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: ACCENT,
            margin: "0 0 14px",
            fontWeight: 700,
          }}
        >
          Opening with Issue 002 · 16 June 2026
        </p>
        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: "clamp(56px, 9vw, 96px)",
            letterSpacing: "0.04em",
            lineHeight: 0.92,
            color: INK,
            margin: "0 0 8px",
          }}
        >
          CEÒL
        </h1>
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 18,
            color: ACCENT,
            margin: "0 0 16px",
          }}
        >
          The full music current
        </p>
        <p
          style={{
            fontFamily: SERIF,
            fontSize: 17,
            color: INK,
            lineHeight: 1.65,
            margin: "0 auto",
            maxWidth: 620,
          }}
        >
          The hub page carries the cover. This is the inside of the magazine.
        </p>
      </div>
    </section>
  );
}

function WhatsInside() {
  const blocks = [
    {
      label: "The Full Top 50",
      body:
        "Every artist anchoring the Gaelic and Scottish-traditional world this week, ranked, with the full editorial Current copy and the Spotify / YouTube links you'd actually click.",
    },
    {
      label: "The Seven Currents — In Full",
      body:
        "Trad-rock, acoustic, electronic crossover, Te Reo Gàidhlig, heavy/folk metal, diaspora crossover, and Heatseekers — each vertical opens up to a full ranking with notes and provenance.",
    },
    {
      label: "Release Calendar",
      body:
        "Every upcoming Gaelic and Scottish-trad album release we're tracking, ordered by date, with pre-save and pre-order links the moment they go live.",
    },
    {
      label: "Tour Watch",
      body:
        "The map of who's playing where this season — Scotland, Cape Breton, the US east coast, Australia, anywhere the diaspora is gathered. Linked to each band's official tour page.",
    },
  ];
  return (
    <section style={{ background: PARCHMENT, padding: "20px 28px 56px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {blocks.map((b, i) => (
            <article
              key={i}
              style={{
                background: PAPER,
                border: `1px solid ${DIVIDER}`,
                borderRadius: 6,
                padding: "18px 20px",
              }}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: 2.5,
                  textTransform: "uppercase",
                  color: ACCENT,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                {b.label}
              </div>
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: INK,
                  margin: 0,
                }}
              >
                {b.body}
              </p>
            </article>
          ))}
        </div>

        <div
          style={{
            marginTop: 36,
            padding: "22px 24px",
            background: PAPER,
            border: `1px solid ${DIVIDER}`,
            borderRadius: 6,
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: ACCENT,
                margin: "0 0 6px",
                fontWeight: 700,
              }}
            >
              In the meantime
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 15, color: INK, margin: 0, lineHeight: 1.55 }}>
              This week's Top 10 and Seven Currents are live on the chart issue.
            </p>
          </div>
          <Link
            href="/AnTonn/this-week"
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: 2.5,
              textTransform: "uppercase",
              color: PAPER,
              background: ACCENT,
              padding: "11px 16px",
              borderRadius: 4,
              textDecoration: "none",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            View this week's charts →
          </Link>
        </div>

        <p style={{ marginTop: 24, fontFamily: MONO, fontSize: 10, letterSpacing: 2.5, color: MUTED, textAlign: "center" }}>
          Want a heads-up the moment Ceòl opens? Subscribe to{" "}
          <Link href="/sruth" style={{ color: ACCENT }}>
            Sruth
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${DIVIDER}`, padding: "20px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <p
          style={{
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: MUTED,
            margin: 0,
          }}
        >
          An Tonn &nbsp;·&nbsp; From Global Ceilidh &nbsp;·&nbsp; Tìr Nan Gàidheal &nbsp;·&nbsp; Everywhere
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
      <WhatsInside />
      <Footer />
    </main>
  );
}
