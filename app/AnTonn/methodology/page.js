// /AnTonn/methodology — the long-form essay.

import Link from "next/link";
import AnTonnNav from "../_components/AnTonnNav";

export const metadata = {
  title: "An Tonn — Methodology",
  description: "How An Tonn's weekly rankings are compiled — the full editorial methodology.",
};

const ACCENT = "#6B4E1F";
const INK = "#1A1A1A";
const PAPER = "#FCFCFC";
const PARCHMENT = "#F5F0E8";
const DIVIDER = "#E8DCC8";
const MUTED = "#8A8074";
const SERIF = "'Fraunces', Georgia, serif";
const MONO = "'IBM Plex Mono', Menlo, Consolas, monospace";

export default function AnTonnMethodology() {
  return (
    <main style={{ background: PARCHMENT, minHeight: "100vh" }}>
      <AnTonnNav activeSlug="Methodology" />

      <article
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "32px 24px 60px",
          fontFamily: SERIF,
          fontSize: 17,
          lineHeight: 1.75,
          color: INK,
        }}
      >
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
          Methodology & Chart Overview
        </p>
        <h1
          style={{
            fontFamily: SERIF,
            fontWeight: 900,
            fontSize: "clamp(36px, 6vw, 52px)",
            color: INK,
            margin: "0 0 22px",
            lineHeight: 1.1,
          }}
        >
          Behind the Wave.
        </h1>

        <p>
          An Tonn is compiled weekly by the editorial team at Sruth and Global Ceilidh. The
          mainstream music-tracking systems — Billboard, Official Charts Company, IFPI — are
          built around commercial sales volume in English-language markets. Scottish-traditional
          and Gàidhlig-language music exists outside those systems by design: smaller audience
          totals, longer release cycles, festival-driven rather than radio-driven, and a
          significant share of activity happening on YouTube, BBC Sounds, and direct-from-
          artist Bandcamp rather than the streaming platforms the official charts index.
        </p>

        <p>
          Because of that, niche minority-language and traditional music sub-genres lack a
          centralised quantitative sales tracking engine. An Tonn fills the gap with a
          weighted qualitative and quantitative assessment.
        </p>

        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 800,
            fontSize: 24,
            marginTop: 36,
            color: INK,
          }}
        >
          The five weighted criteria.
        </h2>

        <h3 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 18, marginTop: 22, color: INK }}>
          1. Streaming Activity
        </h3>
        <p>
          Rolling Spotify monthly listener counts, YouTube channel velocity, BBC Sounds and
          Bandcamp activity where measurable. Counted at the artist level for the flagship Top
          10 and at the track level for the Te Reo Gàidhlig list. Weighted: ~30%.
        </p>

        <h3 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 18, marginTop: 22, color: INK }}>
          2. Festival Prominence
        </h3>
        <p>
          Headline and main-stage billing across HebCelt, Belladrum, Celtic Connections, the
          Mòd, Celtic Colours, Grandfather Mountain, Australian Celtic Festival, and the wider
          touring circuit. Rolling 12-month window. Weighted: ~20%.
        </p>

        <h3 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 18, marginTop: 22, color: INK }}>
          3. Awards & Accolades
        </h3>
        <p>
          MG ALBA Scots Trad Music Awards, the Mòd's competitive prizes, Royal Conservatoire of
          Scotland recognition, the Gaelic Books Council's Leabhar na Bliadhna for the books
          vertical, BBC Folk Awards historical context, and international industry recognition
          where it lands. Weighted: ~15%.
        </p>

        <h3 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 18, marginTop: 22, color: INK }}>
          4. Cultural Relevance
        </h3>
        <p>
          Linguistic content (Gàidhlig vs. English vs. instrumental), heritage and diaspora
          impact, the degree to which an artist or work is anchoring a community somewhere in
          the world — Cape Breton, Seattle, Antigonish, Sydney, Stornoway. Weighted: ~20%.
        </p>

        <h3 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 18, marginTop: 22, color: INK }}>
          5. Editorial Assessment
        </h3>
        <p>
          The editor's read on momentum, importance, and scene context. The honest acknowledgment
          that no algorithm catches a record about to break, an artist about to disappear, or
          a sub-genre about to take off. Weighted: ~15%. We sign our names to it.
        </p>

        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 800,
            fontSize: 24,
            marginTop: 40,
            color: INK,
          }}
        >
          The pilot phase.
        </h2>
        <p>
          Issues 001 through 003 are the pilot. Rankings during the pilot weight criterion #5
          (editorial assessment) higher than steady state, because the data pipelines for
          criteria #1 and #2 are still being instrumented. By Issue 004 we expect to be running
          Spotify and YouTube data ingest weekly, with full transparency about which figures
          drove which ranking.
        </p>

        <h2
          style={{
            fontFamily: SERIF,
            fontWeight: 800,
            fontSize: 24,
            marginTop: 40,
            color: INK,
          }}
        >
          What we don't do.
        </h2>
        <p>
          We don't accept payment for placement. We don't run advertising inside the rankings.
          We don't include an artist because their label asked. We don't exclude an artist for
          being on the wrong label. If a Sruth editor has a personal or commercial relationship
          with anyone on the chart, it's disclosed at the bottom of the issue.
        </p>

        <p style={{ marginTop: 40, fontFamily: MONO, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: MUTED }}>
          Compiled by the editorial team · Sruth & Global Ceilidh ·{" "}
          <Link href="/AnTonn" style={{ color: ACCENT }}>
            ← back to the cover
          </Link>
        </p>
      </article>

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
