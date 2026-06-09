// /AnTonn/archive — past-issue list.
//
// One row per past issue. Issue 001 is the current cover (links into
// /AnTonn). As the archive grows, finished issues get permanent slugs
// like /AnTonn/issue/001 and the most recent one stops being "Current".

import Link from "next/link";
import AnTonnNav from "../_components/AnTonnNav";

export const metadata = {
  title: "An Tonn — Archive",
  description: "Past issues of An Tonn — the weekly chronicle of the Gaelic current.",
};

const ACCENT = "#6B4E1F";
const INK = "#1A1A1A";
const PAPER = "#FCFCFC";
const PARCHMENT = "#F5F0E8";
const DIVIDER = "#E8DCC8";
const MUTED = "#8A8074";
const SERIF = "'Fraunces', Georgia, serif";
const MONO = "'IBM Plex Mono', Menlo, Consolas, monospace";

const PAST_ISSUES = [
  {
    number: 1,
    date_gd: "Dimàirt 9 Ògmhios 2026",
    date_en: "Tuesday 9 June 2026",
    headline: "The Pilot Issue — Tide Lines holds, Valtos surges, Sian arrives.",
    href: "/AnTonn/this-week",
    is_current: true,
  },
];

export default function AnTonnArchive() {
  return (
    <main style={{ background: PARCHMENT, minHeight: "100vh" }}>
      <AnTonnNav activeSlug="Archive" />

      <section style={{ padding: "32px 24px 60px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: ACCENT,
              margin: "0 0 12px",
            }}
          >
            The Archive
          </p>
          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 900,
              fontSize: "clamp(32px, 5vw, 44px)",
              color: INK,
              margin: "0 0 14px",
              lineHeight: 1.1,
            }}
          >
            Every issue of An Tonn, in chronological order.
          </h1>
          <p
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontSize: 16,
              color: MUTED,
              margin: "0 0 36px",
              lineHeight: 1.55,
            }}
          >
            A new issue every Tuesday. As the archive grows, the past issues will sit here
            indefinitely — you can always come back and see what was on the wave that week.
          </p>
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {PAST_ISSUES.map((iss) => (
              <li
                key={iss.number}
                style={{
                  display: "grid",
                  gridTemplateColumns: "64px 1fr auto",
                  gap: 18,
                  padding: "18px 0",
                  borderTop: `1px solid ${DIVIDER}`,
                  alignItems: "baseline",
                }}
              >
                <div
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 900,
                    fontSize: 32,
                    color: INK,
                  }}
                >
                  {String(iss.number).padStart(3, "0")}
                </div>
                <div>
                  <Link
                    href={iss.href}
                    style={{
                      fontFamily: SERIF,
                      fontSize: 18,
                      color: INK,
                      textDecoration: "none",
                      fontWeight: 700,
                      borderBottom: `1px solid ${ACCENT}`,
                    }}
                  >
                    {iss.headline}
                  </Link>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: MUTED,
                      marginTop: 4,
                    }}
                  >
                    {iss.date_gd} · {iss.date_en}
                  </div>
                </div>
                <div>
                  {iss.is_current && (
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: 2,
                        textTransform: "uppercase",
                        color: PAPER,
                        background: ACCENT,
                        padding: "4px 8px",
                        borderRadius: 3,
                      }}
                    >
                      Current
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

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
    </main>
  );
}
