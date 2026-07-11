// Shared top nav for every /AnTonn page. One source of truth so the
// chrome stays identical across the cover, /this-week, the verticals,
// the archive, and the methodology essay.
//
// Visual lineage: clean horizontal bar, sruth. wordmark left, primary
// nav items centered, social icons right. Sits above the hero on the
// cover and at the top of every subsection page.

import Link from "next/link";
import LanguagePill from "../../../components/LanguagePill";

const ACCENT = "#6B4E1F";
const INK = "#1A1A1A";
const MUTED = "#8A8074";
const MONO = "'IBM Plex Mono', Menlo, Consolas, monospace";

const SRUTH_WORDMARK_URL =
  "https://gakdrndravhtvaaimnhl.supabase.co/storage/v1/object/public/assets/wordmark.png";

const NAV_ITEMS = [
  { href: "/AnTonn", label: "An Tonn", match: "exact" },
  { href: "/AnTonn/music", label: "Music" },
  { href: "/AnTonn/books", label: "Books" },
  { href: "/AnTonn/podcasts", label: "Podcasts" },
  { href: "/AnTonn/archive", label: "Archive" },
  { href: "/AnTonn/methodology", label: "Methodology" },
  { href: "/AnTonn/vote", label: "Vote" },
];

function SocialIcon({ children, href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: INK,
        color: "#FCFCFC",
        textDecoration: "none",
        marginLeft: 8,
      }}
    >
      {children}
    </a>
  );
}

export default function AnTonnNav({ activeSlug }) {
  return (
    <nav
      style={{
        background: "transparent",
        padding: "18px 28px 14px",
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: 24,
          alignItems: "center",
        }}
      >
        <Link href="/sruth" style={{ display: "inline-block", lineHeight: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SRUTH_WORDMARK_URL}
            alt="sruth."
            style={{ height: 42, width: "auto", display: "block" }}
          />
        </Link>

        <ul
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 28,
            listStyle: "none",
            margin: 0,
            padding: 0,
            flexWrap: "wrap",
          }}
        >
          {NAV_ITEMS.map((it) => {
            const isActive = activeSlug && it.label.toLowerCase() === activeSlug.toLowerCase();
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: 2.5,
                    textTransform: "uppercase",
                    color: isActive ? ACCENT : INK,
                    textDecoration: "none",
                    borderBottom: isActive ? `2px solid ${ACCENT}` : "2px solid transparent",
                    paddingBottom: 3,
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguagePill position="inline" variant="light" />
          <SocialIcon href="https://www.facebook.com/globalceilidh" label="Facebook">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9.5 21v-8H7v-3h2.5V7.5C9.5 5 11 3.5 13.5 3.5c1 0 2 .1 2.3.1V6h-1.4c-1.1 0-1.4.6-1.4 1.4V10H16l-.4 3h-2.6v8h-3.5z"/>
            </svg>
          </SocialIcon>
          <SocialIcon href="https://www.instagram.com/globalceilidh" label="Instagram">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" ry="5"/>
              <path d="M16 11.37a4 4 0 1 1-7.93 1.18 4 4 0 0 1 7.93-1.18z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </SocialIcon>
          <SocialIcon href="mailto:sruth_editors@globalceilidh.com" label="Email">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </SocialIcon>
        </div>
      </div>
    </nav>
  );
}
