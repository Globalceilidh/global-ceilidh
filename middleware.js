import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const GC_KEY = "6776";
const COOKIE_NAME = "gc_access";

// These routes are always public — no key required.
//
// Site-wide gating policy (Scott, 2026-08-07 — "shut the door"): the
// outside world may reach ONLY three products — Global Ceilidh Radio,
// the "Let's Talk" contact page, and Sruth (the newsletter product +
// archive). EVERYTHING else — the Duilleag/social layer, An Saoghal,
// the An Tonn wing (Ceòl/Bhidio/Leabhraichean/Pod-chraoladh + hub),
// artist pages, Rooms, contributor upload links, /welcome, /u/ profiles —
// is now closed to the public and sits behind the cookie-key gate.
// Insiders open the whole site by visiting any URL with ?key=6776, which
// sets the gc_access cookie for 30 days (see below); a keyed request
// passes every route, so members/editors are unaffected.
//
// Only the auth pages + framework/asset paths are also public, because
// the three open products (and the keyed sign-in flow) need them to
// function. Add a route here only when it's ready for public visibility.
const PUBLIC_PREFIXES = [
  // Sruth — the launched newsletter product + its public archive
  // (/sruth/archive). One of the three doors left open to the world.
  "/sruth",
  // Global Ceilidh Radio: public for listener traffic + AdSense revenue.
  // Radio lives at the top-level /radio; /AnTonn/radio 308-redirects to it
  // (next.config.js) but is kept public as a belt-and-braces so the
  // redirect never trips the cookie gate.
  "/radio",
  "/AnTonn/radio",
  // The "Let's Talk" contact/about page — the pill on Radio points here;
  // the third door left open. (LetsTalk.js also opens it as an in-place
  // overlay on the public pages, so it works without navigation too.)
  "/contact",
  // Clerk embedded sign-in / sign-up. Kept public so the auth surface is
  // reachable and Clerk's protect→/sign-in redirect never loops back to
  // "/". These leak no GC content; a signed-in user still needs the
  // cookie key to pass any gated route.
  "/sign-in",
  "/sign-up",
  // AdSense verification for the radio, framework internals, and assets —
  // required for the open products to render.
  "/ads.txt",
  "/api/",
  "/_next/",
  "/favicon",
];
const PUBLIC_EXTENSIONS = /\.(png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|css|js)$/i;

function isPublic(pathname) {
  // The root stays public: it's the whirlpool front door AND the redirect
  // target for every blocked request, so it must never bounce to itself.
  // Its links into the (now gated) site simply return keyless visitors
  // here. The An Tonn hub (/AnTonn) is no longer public — the wing is
  // closed with everything else under the 2026-08-07 "shut the door" policy.
  if (pathname === "/") return true;
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
