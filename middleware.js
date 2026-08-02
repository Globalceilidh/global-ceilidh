import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const GC_KEY = "6776";
const COOKIE_NAME = "gc_access";

// These routes are always public — no key required.
//
// Site-wide gating policy (Scott, 2026-05-30): everything is pre-launch
// gated EXCEPT the root, the launched Sruth product, and the Sruth
// archive. Anything still in development — /news, future marketing pages,
// editor previews — sits behind the cookie-key gate. The editor accesses
// gated routes by visiting any URL with ?key=6776, which sets the
// gc_access cookie for 30 days. Add a route here only when it's ready
// for public visibility.
const PUBLIC_PREFIXES = [
  "/sruth",
  "/feisean",
  "/coming-soon-features",
  // Rooms are pre-launch-public so invitees can land on a /rooms/<slug>
  // URL without needing the editor's cookie key. Clerk auth still gates
  // entry — see app/rooms/[slug]/page.js and the token route.
  "/rooms",
  // Global Ceilidh Radio + An Tonn Bhidio: public for listener/viewer
  // traffic + AdSense revenue. Radio now lives at the top-level /radio;
  // /AnTonn/radio 308-redirects to it (next.config.js) but is kept public
  // as a belt-and-braces so the redirect never trips the cookie gate.
  "/radio",
  "/AnTonn/radio",
  "/AnTonn/bhidio",
  // The live An Tonn verticals (flipped 2026-07-28) — public wing so the
  // constellation's tiles work without the editor cookie.
  "/AnTonn/ceol",
  "/AnTonn/leabhraichean",
  "/AnTonn/podcraoladh",
  // An Saoghal — the map of the Gaelic world. Public + crawlable: it's a
  // door on the new / homepage and the destination of the vortex centre.
  "/saoghal",
  // Public artist pages — the destination of the /radio INFO "Full profile"
  // CTA and a crawlable landing surface for radio-driven traffic.
  "/artists",
  // Clerk embedded sign-in / sign-up. These MUST be reachable without
  // the pre-launch cookie key — a first-time invitee following a room
  // link has no cookie yet, and would loop through /sign-in?redirect_
  // url=... straight back to "/" if the middleware bounced them.
  "/sign-in",
  "/sign-up",
  // Social layer: onboarding + public profile pages. These bypass the
  // pre-launch cookie gate (a freshly signed-up user has no gc_access
  // cookie), but Clerk still gates the sensitive parts — /welcome runs
  // auth() and bounces to /sign-in if signed out; /u/<handle> is a
  // public profile view by design.
  "/welcome",
  "/u/",
  // The Duilleag-cèilidh — a person's own private room. It bypasses the
  // cookie gate for the same reason /welcome does (a new signup has no
  // gc_access cookie), but it is the most private surface on the site:
  // the page itself calls auth() and redirects signed-out visitors to
  // /sign-in, and there is no visitor mode to fall through to.
  "/duilleag",
  // Per-contributor upload links (globalceilidh.com/contribute/<token>).
  // These are personal, tokened, and noindexed — a contributor with no
  // Clerk account and no cookie key must be able to reach their link.
  "/contribute",
  // The "Let's Talk" contact/about page — the pill on Radio/An Tonn/marble
  // points here; must be reachable without the pre-launch cookie key.
  "/contact",
  "/ads.txt",
  "/api/",
  "/_next/",
  "/favicon",
];
const PUBLIC_EXTENSIONS = /\.(png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|css|js)$/i;

function isPublic(pathname) {
  if (pathname === "/") return true;
  // The An Tonn wing hub (the constellation, flipped in 2026-07-28) is public —
  // the home-page An Tonn icon points here. Exact match only, so the parked
  // magazine (/AnTonn/cover, /AnTonn/this-week, …) stays gated.
  if (pathname === "/AnTonn") return true;
  if (PUBLIC_EXTENSIONS.test(pathname)) return true;
  return PUBLIC_PREFIXES.some(p => pathname.startsWith(p));
}

export default clerkMiddleware((auth, request) => {
  const { pathname, searchParams } = request.nextUrl;

  // Case-normalize AnTonn URLs. Vercel runs on Linux (case-sensitive
  // filesystem), so /antonn/radio does NOT match the /AnTonn/radio
  // route file and 404s — then the middleware below treats the miss
  // as "not public" and bounces it to /. Phone browsers auto-lowercase
  // typed URLs, and Google indexes tend to lowercase too, so real
  // listeners kept ending up on the home page instead of the radio.
  // 308 preserves the method and tells search engines the canonical
  // spelling is /AnTonn.
  if (pathname.toLowerCase().startsWith("/antonn") &&
      !pathname.startsWith("/AnTonn")) {
    const canonical = "/AnTonn" + pathname.slice(7); // '/antonn'.length === 7
    const dest = new URL(canonical + request.nextUrl.search, request.url);
    return NextResponse.redirect(dest, 308);
  }

  // If key is in the URL, set the cookie and redirect to the originally
  // requested path (defaulting to /home if the request was for the root).
  // Other query params survive so utm tags or anchors aren't dropped on
  // the way through the gate. Cookie gets set so future requests don't
  // need the ?key= dance.
  //
  // Previously this always redirected to /home regardless of where you
  // came from, which meant /AnTonn?key=6776 unlocked the gate but landed
  // you on /home — forcing a second click to actually reach /AnTonn.
  if (searchParams.get("key") === GC_KEY) {
    const targetPath = pathname === '/' ? '/home' : pathname;
    const dest = new URL(targetPath, request.url);
    for (const [k, v] of searchParams.entries()) {
      if (k !== 'key') dest.searchParams.set(k, v);
    }
    const response = NextResponse.redirect(dest);
    response.cookies.set(COOKIE_NAME, GC_KEY, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return response;
  }

  // Public routes — always allow. Rooms pages do client-side auth via
  // Clerk's React SDK (see app/rooms/[slug]/RoomClient.js) because the
  // server-side __session cookie isn't reliably propagated across
  // subdomains in this Clerk setup. The token API route reads its own
  // Bearer token from the client.
  if (isPublic(pathname)) return NextResponse.next();

  // Vercel preview deployments: skip the cookie gate. Vercel's
  // Deployment Protection (Vercel Authentication: Standard) wraps every
  // preview URL in an SSO redirect, and that flow strips the ?key=
  // query string when it bounces back — so users following any
  // preview-deployment link with ?key=6776 never actually get the
  // gc_access cookie set, and bounce to "/" forever. On *.vercel.app
  // hosts the Vercel Auth gate IS the security; the cookie gate is
  // redundant and harmful. Production (globalceilidh.com) unaffected.
  const host = request.nextUrl.hostname;
  if (host.endsWith('.vercel.app')) return NextResponse.next();

  // Check cookie for access to the real site
  const cookie = request.cookies.get(COOKIE_NAME);
  if (cookie?.value === GC_KEY) return NextResponse.next();

  // No access — send to coming soon
  return NextResponse.redirect(new URL("/", request.url));
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
