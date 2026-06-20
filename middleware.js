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

const ROOM_ROUTES = /^\/rooms($|\/)/;

export default clerkMiddleware(async (auth, request) => {
  const { pathname, searchParams } = request.nextUrl;

  // If key is in the URL, set the cookie and redirect (stripping the key param)
  if (searchParams.get("key") === GC_KEY) {
    const dest = new URL('/home', request.url);
    const response = NextResponse.redirect(dest);
    response.cookies.set(COOKIE_NAME, GC_KEY, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return response;
  }

  // Rooms — pre-launch cookie not required, but Clerk auth IS required.
  // Calling auth.protect() here (rather than just letting NextResponse.next()
  // pass through) is what triggers Clerk's handshake mechanism — without
  // this, a user signed into the auth subdomain (accounts.globalceilidh.com)
  // never gets their __session cookie copied to .globalceilidh.com and the
  // page-level auth() returns null in a redirect loop.
  if (ROOM_ROUTES.test(pathname)) {
    await auth.protect();
    return NextResponse.next();
  }

  // Public routes — always allow
  if (isPublic(pathname)) return NextResponse.next();

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
