// Shared "coming soon" layout used by /AnTonn subsections that aren't
// content-ready yet. Same masthead and footer as the hub so it feels
// continuous, not like a 404 dressed up.

import Link from "next/link";

const ACCENT = "#6B4E1F";
const INK = "#1A1A1A";
const PAPER = "#FCFCFC";
const PARCHMENT = "#F5F0E8";
const DIVIDER = "#E8DCC8";
const MUTED = "#8A8074";
const SERIF = "'Fraunces', Georgia, serif";
const MONO = "'IBM Plex Mono', Menlo, Consolas, monospace";

export default function ComingSoon({ title, subtitle, eta, body }) {
  return (
    <main style={{ background: PARCHMENT, minHeight: "100vh" }}>
      <header
        style={{
          background: PAPER,
          borderBottom: `2px solid ${ACCENT}`,
          padding: "28px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/AnTonn"
            style={{
              fontFamily: SERIF,
              fontWeight: 900,
              fontSize: 28,
              letterSpacing: 2,
              color: INK,
              textDecoration: "none",
            }}
          >
            AN TONN
          </Link>
          <Link
            href="/AnTonn"
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: ACCENT,
              textDecoration: "none",
              borderBottom: `1px solid ${ACCENT}`,
              paddingBottom: 1,
            }}
          >
            ← back to the hub
          </Link>
        </div>
      </header>

      <section style={{ padding: "60px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: ACCENT,
              margin: "0 0 14px",
            }}
          >
            {eta || "Building"}
          </p>
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 900,
              fontSize: "clamp(36px, 7vw, 64px)",
              letterSpacing: 1,
              color: INK,
              margin: "0 0 8px",
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 18,
                color: ACCENT,
                margin: "0 0 26px",
              }}
            >
              {subtitle}
            </p>
          )}
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 16,
              lineHeight: 1.7,
              color: INK,
              margin: "0 auto",
              maxWidth: 540,
            }}
          >
            {body}
          </div>
          <div
            style={{
              marginTop: 32,
              padding: "20px 22px",
              background: PAPER,
              border: `1px solid ${DIVIDER}`,
              borderRadius: 6,
              textAlign: "left",
            }}
          >
            <p
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: ACCENT,
                margin: "0 0 8px",
              }}
            >
              Want to know when this lands?
            </p>
            <p
              style={{
                fontFamily: SERIF,
                fontSize: 14,
                lineHeight: 1.6,
                color: INK,
                margin: 0,
              }}
            >
              Subscribers to <Link href="/sruth" style={{ color: ACCENT }}>Sruth</Link> hear about
              every An Tonn launch first. Sign up there and we'll send a single line in the
              Fàilte the morning this opens.
            </p>
          </div>
        </div>
      </section>

      <footer
        style={{
          background: PAPER,
          borderTop: `2px solid ${ACCENT}`,
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Link
            href="/sruth"
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 18,
              color: INK,
              textDecoration: "none",
              borderBottom: `2px solid ${INK}`,
            }}
          >
            sruth.
          </Link>
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
            Daily · From Global Ceilidh · Since 2026
          </p>
        </div>
      </footer>
    </main>
  );
}
