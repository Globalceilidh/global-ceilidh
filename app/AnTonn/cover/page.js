// /AnTonn — the cover.
//
// The cover IS the An Tonn poster mockup. Every visible element — sruth
// logo, top nav, social icons, AN TONN title, wave photograph, issue
// stamp, "Gaelic Current This Week" callout, the seven explore cards,
// the footer — is baked into a single image at /AnTonn/cover.png.
//
// To make the regions clickable, we layer transparent <Link> hotspots
// over the image using percentage-based positioning so they scale with
// the viewport. Coordinates are tuned to the cover artwork in
// /public/AnTonn/cover.png; if the artwork is replaced, re-tune the
// hotspots.

import Link from "next/link";
import LanguagePill from "../../../components/LanguagePill";

export const metadata = {
  title: "An Tonn — The Chronicle of the Gaelic Current",
  description:
    "An Tonn (The Wave) is Sruth's weekly chronicle of Scottish and Gàidhlig music, books, podcasts, and the wider Gaelic current.",
};

// Each hotspot is a percentage-based rectangle over the cover image and
// the destination it links to. left/top are the upper-left corner;
// width/height are the box size. All in percent of the image's rendered
// box, so the hotspots scale with the image at every viewport width.
const HOTSPOTS = [
  // ── Top bar ─────────────────────────────────────────────
  // sruth. wordmark (top-left)
  { top: "2.5%",  left: "2%",   width: "9%",  height: "4%", href: "/",                   label: "sruth — home" },

  // Top nav (centred run of links)
  { top: "2.5%",  left: "24.5%", width: "7%",  height: "4%", href: "/AnTonn",            label: "An Tonn" },
  { top: "2.5%",  left: "32%",  width: "5%",  height: "4%", href: "/AnTonn/music",       label: "Music" },
  { top: "2.5%",  left: "38%",  width: "5%",  height: "4%", href: "/AnTonn/books",       label: "Books" },
  { top: "2.5%",  left: "44%",  width: "7%",  height: "4%", href: "/AnTonn/podcasts",    label: "Podcasts" },
  { top: "2.5%",  left: "52%",  width: "6%",  height: "4%", href: "/AnTonn/archive",     label: "Archive" },
  { top: "2.5%",  left: "59%",  width: "9%",  height: "4%", href: "/AnTonn/methodology", label: "Methodology" },
  { top: "2.5%",  left: "69%",  width: "4%",  height: "4%", href: "/AnTonn/vote",        label: "Vote" },

  // Social icons (top-right)
  { top: "2.5%",  left: "87%",  width: "4%",  height: "4%", href: "https://www.facebook.com/globalceilidh",  label: "Facebook",  external: true },
  { top: "2.5%",  left: "91%",  width: "4%",  height: "4%", href: "https://www.instagram.com/globalceilidh", label: "Instagram", external: true },
  { top: "2.5%",  left: "95%",  width: "4%",  height: "4%", href: "mailto:hello@globalceilidh.com",          label: "Email",     external: true },

  // ── The Gaelic Current This Week callout strip ──────────
  { top: "62%",  left: "3%",   width: "94%", height: "10%", href: "/AnTonn/this-week", label: "View this week's charts" },

  // ── The seven explore cards (bottom row) ────────────────
  { top: "74%",  left: "3%",   width: "12.7%", height: "21%", href: "/AnTonn/music",     label: "Music Current" },
  { top: "74%",  left: "16.5%", width: "12.7%", height: "21%", href: "/AnTonn/books",    label: "Books Current" },
  { top: "74%",  left: "30%",  width: "12.7%", height: "21%", href: "/AnTonn/podcasts",  label: "Podcast Current" },
  { top: "74%",  left: "43.5%", width: "12.7%", height: "21%", href: "/AnTonn/film",     label: "Film & TV Current" },
  { top: "74%",  left: "57%",  width: "12.7%", height: "21%", href: "/radio",     label: "Radio (Coming Soon)" },
  { top: "74%",  left: "70.5%", width: "12.7%", height: "21%", href: "/AnTonn/archive",  label: "Archive" },
  { top: "74%",  left: "84%",  width: "12.7%", height: "21%", href: "/AnTonn/vote",     label: "Vote & Suggest" },
];

export default function AnTonnCover() {
  return (
    <main style={{ background: "#F5F0E8", minHeight: "100vh" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          margin: 0,
          lineHeight: 0, // strip the inline-block baseline gap under the image
        }}
      >
        <LanguagePill position="top-left" variant="light" />
        <img
          src="/AnTonn/cover.png"
          alt="An Tonn — The Chronicle of the Gaelic Current. Pilot issue, Tuesday 9 Ògmhios 2026. The Gaelic Current This Week — Top 10 artists. Explore: Music, Books, Podcasts, Film & TV, Radio, Archive, Vote & Suggest."
          style={{
            display: "block",
            width: "100%",
            height: "auto",
            userSelect: "none",
          }}
          draggable={false}
        />

        {HOTSPOTS.map((h, i) => {
          const baseStyle = {
            position: "absolute",
            top: h.top,
            left: h.left,
            width: h.width,
            height: h.height,
            display: "block",
            background: "transparent",
            textIndent: "-9999px",
            overflow: "hidden",
            cursor: "pointer",
          };
          if (h.external) {
            return (
              <a
                key={i}
                href={h.href}
                target={h.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                aria-label={h.label}
                style={baseStyle}
              >
                {h.label}
              </a>
            );
          }
          return (
            <Link key={i} href={h.href} aria-label={h.label} style={baseStyle}>
              {h.label}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
