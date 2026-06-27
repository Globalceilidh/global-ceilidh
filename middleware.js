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
  "/api/",
  "/_next/",
  "/favicon",
];
const PUBLIC_EXTENSIONS = /\.(png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|css|js)$/i;

function isPublic(pathname) {
  if (pathname === "/") return true;
  if (PUBLIC_EXTENSIONS.test(pathname)) return true;
  return PUBLIC_PREFIXES.some(p => pathname.startsWith(p));
}

export default clerkMiddleware((auth, request) => {
  const { pathname, searchParams } = request.nextUrl;

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
