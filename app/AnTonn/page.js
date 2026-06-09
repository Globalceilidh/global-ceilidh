// An Tonn — Hub page
// /AnTonn → the current week's pilot issue, magazine-style scroll.
//
// Visual lineage: Fraunces + IBM Plex Mono + warm palette to sit cleanly
// next to /sruth and /feisean. The poster (the source image) is print-
// dense; this layout is the scroll-friendly editorial adaptation. Hub
// shows the cover; per-section verticals (/AnTonn/music, /books, /podcasts)
// will hold the full per-item Spotify/buy/listen links.

import Link from "next/link";
import { issue, spotlights, top10, currents, books, methodology } from "./data/week-2026-06-09";

export const metadata = {
  title: "An Tonn — The Chronicle of the Gaelic Current",
  description:
    "An Tonn (The Wave) is Sruth's weekly chronicle of the Gaelic current — flagship rankings of Scottish and Gàidhlig music, books, and podcasts.",
};

const ACCENT = "#6B4E1F";
const INK = "#1A1A1A";
const PAPER = "#FCFCFC";
const PARCHMENT = "#F5F0E8";
const DIVIDER = "#E8DCC8";
const MUTED = "#8A8074";
const SERIF = "'Fraunces', Georgia, serif";
const MONO = "'IBM Plex Mono', Menlo, Consolas, monospace";

// ── Atom helpers ───────────────────────────────────────────────────────

function Eyebrow({ children, color = ACCENT, size = 11, style }) {
  return (
    <p
      style={{
        fontFamily: MONO,
        fontSize: size,
        letterSpacing: 3,
        textTransform: "uppercase",
        color,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

function MovementBadge({ movement }) {
  if (!movement) return null;
  const { type, amount } = movement;
  const config = {
    up: { color: "#1F7A37", glyph: "▲" },
    down: { color: "#B83232", glyph: "▼" },
    hold: { color: "#999", glyph: "—" },
    new: { color: "#C49100", glyph: "★" },
  }[type] || { color: "#999", glyph: "—" };
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 11,
        color: config.color,
        letterSpacing: 1,
        whiteSpace: "nowrap",
      }}
      aria-label={type === "new" ? "new entry" : type === "hold" ? "holding" : `${type} ${amount}`}
    >
      {config.glyph} {type === "new" ? "" : type === "hold" ? "" : amount}
    </span>
  );
}

function SpotifyLink({ href, label = "Spotify" }) {
  if (!href || href === "#") return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: ACCENT,
        textDecoration: "none",
        borderBottom: `1px solid ${ACCENT}`,
        paddingBottom: 1,
      }}
    >
      {label} →
    </a>
  );
}

// ── Sections ──────────────────────────────────────────────────────────

function Masthead() {
  return (
    <header
      style={{
        background: PAPER,
        borderBottom: `2px solid ${ACCENT}`,
        padding: "32px 24px 28px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div>
            <Link
              href="/sruth"
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 22,
                color: INK,
                textDecoration: "none",
                borderBottom: `2px solid ${INK}`,
                paddingBottom: 2,
              }}
            >
              sruth.
            </Link>
          </div>
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontFamily: SERIF,
                fontWeight: 900,
                fontSize: "clamp(48px, 9vw, 96px)",
                letterSpacing: 2,
                lineHeight: 1,
                margin: 0,
                color: INK,
              }}
            >
              AN TONN
            </h1>
            <div
              style={{
                margin: "6px auto 0",
                width: "60%",
                height: 6,
                background:
                  `repeating-linear-gradient(90deg, ${ACCENT}, ${ACCENT} 8px, transparent 8px, transparent 14px)`,
                borderRadius: 2,
                opacity: 0.7,
              }}
            />
            <p
              style={{
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 14,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: ACCENT,
                margin: "10px 0 0",
              }}
            >
              The Chronicle of the Gaelic Current
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <Eyebrow size={9}>Issue {String(issue.number).padStart(3, "0")}</Eyebrow>
            <p
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 14,
                margin: "6px 0 0",
                color: INK,
              }}
            >
              {issue.date_gd}
            </p>
            <p style={{ fontFamily: MONO, fontSize: 10, color: MUTED, margin: "2px 0 0" }}>
              {issue.date_en}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function Intro() {
  return (
    <section style={{ background: PAPER, padding: "28px 24px 32px", borderBottom: `1px solid ${DIVIDER}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow style={{ textAlign: "center", marginBottom: 18 }}>
          {issue.tagline}
        </Eyebrow>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 32,
            fontFamily: SERIF,
            fontSize: 14,
            lineHeight: 1.65,
            color: INK,
          }}
        >
          <p style={{ margin: 0 }}>
            {issue.intro_left.split(/(An Tonn \(The Wave\))/g).map((chunk, i) =>
              chunk === "An Tonn (The Wave)" ? (
                <em key={i}>{chunk}</em>
              ) : (
                chunk
              )
            )}
          </p>
          <p style={{ margin: 0 }}>{issue.intro_right}</p>
        </div>
      </div>
    </section>
  );
}

function SpotlightStrip() {
  return (
    <section style={{ background: PARCHMENT, padding: "32px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2
          style={{
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: ACCENT,
            margin: "0 0 22px",
          }}
        >
          → The Gaelic Current This Week ←
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
          }}
        >
          {spotlights.map((s, i) => (
            <div
              key={i}
              style={{
                background: PAPER,
                border: `2px solid ${s.accent}`,
                borderRadius: 6,
                padding: "16px 18px",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22, color: s.accent, lineHeight: 1 }}>{s.icon}</span>
                <Eyebrow size={9} color={s.accent}>
                  {s.label}
                </Eyebrow>
              </div>
              <div
                style={{
                  fontFamily: SERIF,
                  fontWeight: 800,
                  fontSize: 18,
                  lineHeight: 1.2,
                  color: INK,
                  textTransform: "uppercase",
                }}
              >
                {s.title}
              </div>
              {s.subtitle && (
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 9,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: MUTED,
                    marginTop: 6,
                  }}
                >
                  {s.subtitle}
                </div>
              )}
              {(s.spotify_url && s.spotify_url !== "#") && (
                <div style={{ marginTop: 10 }}>
                  <SpotifyLink href={s.spotify_url} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Top10() {
  return (
    <section style={{ background: PAPER, padding: "40px 24px", borderTop: `1px solid ${DIVIDER}` }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 900,
            fontSize: 30,
            margin: "0 0 6px",
            color: INK,
          }}
        >
          The Flagship Top 10 Overall
        </h2>
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 14,
            color: MUTED,
            margin: "0 0 28px",
            lineHeight: 1.55,
          }}
        >
          Our flagship ranking tracking the most impactful artists, tracks, and projects
          anchoring the global diaspora community this week.
        </p>
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {top10.map((item) => (
            <li
              key={item.rank}
              style={{
                display: "grid",
                gridTemplateColumns: "64px 1fr",
                gap: 18,
                padding: "16px 0",
                borderTop: `1px solid ${DIVIDER}`,
                alignItems: "start",
              }}
            >
              <div
                style={{
                  fontFamily: SERIF,
                  fontWeight: 900,
                  fontSize: 44,
                  lineHeight: 1,
                  color: INK,
                  textAlign: "right",
                }}
              >
                {item.rank}
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <h3
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 800,
                      fontSize: 20,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      color: INK,
                      margin: 0,
                    }}
                  >
                    {item.artist}
                  </h3>
                  <MovementBadge movement={item.movement} />
                </div>
                <p
                  style={{
                    fontFamily: SERIF,
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: INK,
                    margin: "6px 0 0",
                  }}
                >
                  <strong style={{ fontVariant: "small-caps", letterSpacing: 1 }}>The Current:</strong>{" "}
                  {item.current}
                </p>
                {(item.spotify_url !== "#" || item.youtube_url !== "#") && (
                  <div style={{ marginTop: 10, display: "flex", gap: 14 }}>
                    <SpotifyLink href={item.spotify_url} label="Spotify" />
                    <SpotifyLink href={item.youtube_url} label="YouTube" />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
        <p
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: 2,
            color: MUTED,
            marginTop: 16,
          }}
        >
          ▲ Rising · ▼ Falling · — Holding · ★ New Entry
        </p>
      </div>
    </section>
  );
}

function SevenCurrents() {
  return (
    <section style={{ background: PARCHMENT, padding: "44px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 900,
            fontSize: 30,
            margin: "0 0 6px",
            color: INK,
          }}
        >
          The Deeper Dive: The Seven Currents
        </h2>
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 14,
            color: MUTED,
            margin: "0 0 28px",
            lineHeight: 1.55,
          }}
        >
          The flagship Top 10 sets the destination; our specialised currents track exactly how
          the sub-genres are moving.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {currents.map((c) => (
            <article
              key={c.slug}
              style={{
                background: PAPER,
                border: `1px solid ${DIVIDER}`,
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <header
                style={{
                  background: c.accent,
                  color: "#FCFCFC",
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 18 }}>{c.icon}</span>
                <span
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 800,
                    fontSize: 14,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  {c.name}
                </span>
              </header>
              <ol style={{ listStyle: "none", padding: "12px 18px 16px", margin: 0 }}>
                {c.items.map((it, i) => (
                  <li
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "22px 1fr",
                      padding: "6px 0",
                      fontFamily: SERIF,
                      fontSize: 14,
                      color: INK,
                    }}
                  >
                    <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>
                      {i + 1}
                    </span>
                    <span>{it}</span>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BooksRiding() {
  return (
    <section style={{ background: PAPER, padding: "40px 24px", borderTop: `1px solid ${DIVIDER}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 22, color: ACCENT }}>📖</span>
          <h2
            style={{
              fontFamily: SERIF,
              fontWeight: 900,
              fontSize: 24,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: INK,
              margin: 0,
            }}
          >
            Leabhraichean Air An Tonn
          </h2>
        </div>
        <Eyebrow style={{ marginBottom: 24 }}>Books Riding The Wave</Eyebrow>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 20,
          }}
        >
          {books.map((b, i) => (
            <article key={i}>
              <div
                style={{
                  background: PARCHMENT,
                  border: `1px solid ${DIVIDER}`,
                  aspectRatio: "2/3",
                  marginBottom: 10,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 14,
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: 14,
                  color: ACCENT,
                  lineHeight: 1.25,
                }}
              >
                {b.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.cover_url}
                    alt={b.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div>
                    {b.title}
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 9,
                        letterSpacing: 2,
                        color: MUTED,
                        marginTop: 10,
                      }}
                    >
                      Cover · TBA
                    </div>
                  </div>
                )}
              </div>
              <h3
                style={{
                  fontFamily: SERIF,
                  fontWeight: 800,
                  fontSize: 14,
                  letterSpacing: 0.5,
                  color: INK,
                  margin: "6px 0 2px",
                }}
              >
                {b.title}
              </h3>
              {b.subtitle && (
                <p
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 12,
                    color: MUTED,
                    margin: 0,
                  }}
                >
                  {b.subtitle}
                </p>
              )}
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: 12,
                  color: INK,
                  margin: "4px 0 0",
                }}
              >
                by {b.author}
              </p>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: 1,
                  color: MUTED,
                  margin: "4px 0 0",
                  textTransform: "uppercase",
                }}
              >
                {b.release_date ? `Release: ${b.release_date}` : "Recently published"} · {b.publisher}
              </p>
              {b.buy_url !== "#" && (
                <div style={{ marginTop: 6 }}>
                  <SpotifyLink href={b.buy_url} label="Find a copy" />
                </div>
              )}
            </article>
          ))}
        </div>
        <p style={{ marginTop: 16, textAlign: "right" }}>
          <Link
            href="/AnTonn/books"
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
            Open the books vertical →
          </Link>
        </p>
      </div>
    </section>
  );
}

function MethodologyAndVote() {
  return (
    <section style={{ background: PARCHMENT, padding: "40px 24px", borderTop: `1px solid ${DIVIDER}` }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 36,
          alignItems: "start",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 18, color: ACCENT }}>〰</span>
            <h2
              style={{
                fontFamily: SERIF,
                fontWeight: 900,
                fontSize: 22,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: INK,
                margin: 0,
              }}
            >
              Methodology & Chart Overview
            </h2>
          </div>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 14,
              lineHeight: 1.65,
              color: INK,
              margin: "0 0 18px",
            }}
          >
            <strong>Behind the Wave:</strong> An Tonn is compiled weekly by the editorial team
            at Sruth and Global Ceilidh. Because niche minority-language and traditional music
            sub-genres lack a centralised quantitative sales tracking engine, these pilot
            rankings are formulated through a weighted qualitative and quantitative assessment.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {methodology.map((m) => (
              <div key={m.name}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: ACCENT,
                    marginBottom: 4,
                  }}
                >
                  {m.name}
                </div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: INK,
                  }}
                >
                  {m.note}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 2, color: MUTED, marginTop: 18 }}>
            FULL TOP 50 & ARCHIVE AVAILABLE ONLINE ·{" "}
            <Link href="/AnTonn/methodology" style={{ color: ACCENT }}>
              read the methodology in full →
            </Link>
          </p>
        </div>

        <aside
          style={{
            background: PAPER,
            border: `2px solid ${ACCENT}`,
            borderRadius: 6,
            padding: "22px 20px",
          }}
        >
          <Eyebrow color={ACCENT}>Cùm An Còmhradh A' Dol!</Eyebrow>
          <h3
            style={{
              fontFamily: SERIF,
              fontWeight: 800,
              fontSize: 18,
              color: INK,
              margin: "8px 0 12px",
            }}
          >
            Help shape next week's wave.
          </h3>
          <p
            style={{
              fontFamily: SERIF,
              fontSize: 13,
              lineHeight: 1.55,
              color: INK,
              margin: "0 0 16px",
            }}
          >
            Head over to Facebook at <strong>GlobalCeilidh</strong> to tell us what you're
            listening to, sound off on the new layout, and cast your vote. Native voting on this
            page lands next week.
          </p>
          <a
            href="https://www.facebook.com/globalceilidh"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: PAPER,
              background: ACCENT,
              padding: "10px 14px",
              borderRadius: 4,
              textDecoration: "none",
            }}
          >
            Facebook → GlobalCeilidh
          </a>
        </aside>
      </div>
    </section>
  );
}

function SubsectionNav() {
  const sections = [
    { slug: "music", label: "Music", note: "Charts · releases · tours" },
    { slug: "books", label: "Books", note: "Leabhraichean Air An Tonn" },
    { slug: "podcasts", label: "Podcasts", note: "Listen list · reviews" },
    { slug: "film", label: "Film & TV", note: "Coming soon" },
    { slug: "radio", label: "Radio", note: "Coming soon" },
    { slug: "archive", label: "Archive", note: "Past issues" },
  ];
  return (
    <section style={{ background: PAPER, padding: "44px 24px", borderTop: `1px solid ${DIVIDER}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow style={{ marginBottom: 18 }}>The Currents — All Sections</Eyebrow>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          {sections.map((s) => (
            <Link
              key={s.slug}
              href={`/AnTonn/${s.slug}`}
              style={{
                display: "block",
                padding: "16px 18px",
                background: PARCHMENT,
                border: `1px solid ${DIVIDER}`,
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  fontFamily: SERIF,
                  fontWeight: 800,
                  fontSize: 16,
                  color: INK,
                  marginBottom: 2,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: MUTED,
                }}
              >
                {s.note}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
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
          alignItems: "center",
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
        <p
          style={{
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 11,
            color: MUTED,
            margin: 0,
          }}
        >
          Tìr Nan Gàidheal · Everywhere
        </p>
      </div>
    </footer>
  );
}

export default function AnTonnHub() {
  return (
    <main style={{ background: PARCHMENT, minHeight: "100vh" }}>
      <Masthead />
      <Intro />
      <SpotlightStrip />
      <Top10 />
      <SevenCurrents />
      <BooksRiding />
      <MethodologyAndVote />
      <SubsectionNav />
      <Footer />
    </main>
  );
}
