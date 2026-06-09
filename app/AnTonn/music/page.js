// /AnTonn/music — render the Ceòl mockup directly.
//
// Same principle as the cover: the image (antonn_music_hero.png) is the
// full page design. Don't rebuild any of it in CSS. Click overlays for
// the nav and explore cards anchored as absolute-positioned <Link>s on
// top of the image at percentage coordinates.

import Link from "next/link";

export const metadata = {
  title: "An Tonn — Ceòl · Music",
  description:
    "An Tonn's music vertical — the full Top 50, charts, currents, releases, and tour watch shaping the global Gaelic music current.",
};

const COVER_URL =
  "https://gakdrndravhtvaaimnhl.supabase.co/storage/v1/object/public/assets/antonn_music_hero.png";

const OVERLAYS = [
  // Top nav
  { href: "/sruth",              top: "1.5%", left: "3%",   width: "13%", height: "4.5%" },
  { href: "/AnTonn",             top: "2%",   left: "26%",  width: "8%",  height: "3%" },
  { href: "/AnTonn/music",       top: "2%",   left: "35%",  width: "11%", height: "3%" },
  { href: "/AnTonn/books",       top: "2%",   left: "47%",  width: "8%",  height: "3%" },
  { href: "/AnTonn/podcasts",    top: "2%",   left: "56%",  width: "8%",  height: "3%" },
  { href: "/AnTonn/archive",     top: "2%",   left: "65%",  width: "8%",  height: "3%" },
  { href: "/AnTonn/methodology", top: "2%",   left: "74%",  width: "11%", height: "3%" },
  { href: "/AnTonn/vote",        top: "2%",   left: "86%",  width: "6%",  height: "3%" },

  { href: "https://www.facebook.com/globalceilidh",  top: "1.5%", left: "91%",   width: "3%", height: "4%", external: true },
  { href: "https://www.instagram.com/globalceilidh", top: "1.5%", left: "94.3%", width: "3%", height: "4%", external: true },
  { href: "mailto:sruth_editors@globalceilidh.com",  top: "1.5%", left: "97.6%", width: "3%", height: "4%", external: true },

  // "View this week's music charts" callout strip
  { href: "/AnTonn/this-week",   top: "53.5%", left: "2%",  width: "96%", height: "6%" },

  // Six explore cards — Charts · New Releases · Artist Profiles · Tracks · Tour Watch · Live & Video
  { href: "/AnTonn/this-week",   top: "63%",   left: "2%",   width: "15.5%", height: "23%" },  // Charts & Currents
  { href: "/AnTonn/this-week",   top: "63%",   left: "18.5%", width: "15.5%", height: "23%" }, // New Releases
  { href: "/AnTonn/this-week",   top: "63%",   left: "35%",   width: "15.5%", height: "23%" }, // Artist Profiles
  { href: "/AnTonn/this-week",   top: "63%",   left: "51.5%", width: "15.5%", height: "23%" }, // Tracks To Hear
  { href: "/AnTonn/this-week",   top: "63%",   left: "68%",   width: "15.5%", height: "23%" }, // Tour Watch
  { href: "/AnTonn/this-week",   top: "63%",   left: "84.5%", width: "15.5%", height: "23%" }, // Live & Video
];

export default function AnTonnMusic() {
  return (
    <main style={{ background: "#F5F0E8", minHeight: "100vh", padding: 0 }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={COVER_URL}
          alt="Ceòl — The Music of the Gaelic Current"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
        {OVERLAYS.map((o, i) => {
          const style = {
            position: "absolute",
            top: o.top,
            left: o.left,
            width: o.width,
            height: o.height,
            display: "block",
            cursor: "pointer",
          };
          return o.external ? (
            <a
              key={i}
              href={o.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={o.href}
              style={style}
            />
          ) : (
            <Link key={i} href={o.href} aria-label={o.href} style={style} />
          );
        })}
      </div>
    </main>
  );
}
