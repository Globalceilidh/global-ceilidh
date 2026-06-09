// /AnTonn — render the cover mockup directly.
//
// The image at antonn_hero.png is the full page design — sruth wordmark,
// nav row, title block, hero photograph, charts callout strip, the seven
// explore cards, and footer all baked in. Earlier versions of this page
// rebuilt every one of those elements in CSS on top of the image, which
// produced visible duplication (two navs, two titles, two card grids).
//
// This file now just shows the image. Click overlays for the nav items
// and explore cards are anchored as absolute-positioned <Link>s on top
// of the image using percentage coordinates, so the navigation still
// works while the visual identity is whatever the mockup says it is.

import Link from "next/link";

export const metadata = {
  title: "An Tonn — The Chronicle of the Gaelic Current",
  description:
    "An Tonn (The Wave) is Sruth's weekly chronicle of Scottish and Gàidhlig music, books, podcasts, and the wider Gaelic current.",
};

const COVER_URL =
  "https://gakdrndravhtvaaimnhl.supabase.co/storage/v1/object/public/assets/antonn_hero.png";

// Click overlays. Each box covers a portion of the rendered mockup image
// in % terms so the hit areas scale with the image. Tuned against the
// 1320x1920-ish source PNG; widen or nudge if a click target feels off.
// `href` external = absolute URL; internal = Next routes.
const OVERLAYS = [
  // Top nav — sruth wordmark
  { href: "/sruth",                top: "1.5%", left: "3%",  width: "13%", height: "4.5%" },
  // Top nav — section links
  { href: "/AnTonn",               top: "2%",   left: "26%", width: "8%",  height: "3%" },
  { href: "/AnTonn/music",         top: "2%",   left: "35%", width: "8%",  height: "3%" },
  { href: "/AnTonn/books",         top: "2%",   left: "44%", width: "8%",  height: "3%" },
  { href: "/AnTonn/podcasts",      top: "2%",   left: "53%", width: "8%",  height: "3%" },
  { href: "/AnTonn/archive",       top: "2%",   left: "62%", width: "8%",  height: "3%" },
  { href: "/AnTonn/methodology",   top: "2%",   left: "71%", width: "11%", height: "3%" },
  { href: "/AnTonn/vote",          top: "2%",   left: "83%", width: "6%",  height: "3%" },
  // Top right — socials
  { href: "https://www.facebook.com/globalceilidh",  top: "1.5%", left: "91%",   width: "3%", height: "4%", external: true },
  { href: "https://www.instagram.com/globalceilidh", top: "1.5%", left: "94.3%", width: "3%", height: "4%", external: true },
  { href: "mailto:sruth_editors@globalceilidh.com",  top: "1.5%", left: "97.6%", width: "3%", height: "4%", external: true },

  // Centre — "View this week's charts" callout strip
  { href: "/AnTonn/this-week",     top: "53.5%", left: "2%",  width: "96%", height: "6%" },

  // Seven explore cards — Music · Books · Podcasts · Film · Radio · Archive · Vote
  { href: "/AnTonn/music",         top: "63%",  left: "2%",   width: "13%", height: "23%" },
  { href: "/AnTonn/books",         top: "63%",  left: "16%",  width: "13%", height: "23%" },
  { href: "/AnTonn/podcasts",      top: "63%",  left: "30%",  width: "13%", height: "23%" },
  { href: "/AnTonn/film",          top: "63%",  left: "44%",  width: "13%", height: "23%" },
  { href: "/AnTonn/radio",         top: "63%",  left: "58%",  width: "13%", height: "23%" },
  { href: "/AnTonn/archive",       top: "63%",  left: "72%",  width: "13%", height: "23%" },
  { href: "/AnTonn/vote",          top: "63%",  left: "86%",  width: "13%", height: "23%" },
];

export default function AnTonnCover() {
  return (
    <main style={{ background: "#F5F0E8", minHeight: "100vh", padding: 0 }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={COVER_URL}
          alt="An Tonn — The Chronicle of the Gaelic Current"
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
            // Uncomment the line below to debug coordinates visually.
            // background: "rgba(255, 0, 0, 0.2)",
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
