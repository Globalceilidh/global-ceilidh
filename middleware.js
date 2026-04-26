import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const GC_KEY = "6776";
const COOKIE_NAME = "gc_access";

// These routes are always public — no key required
const PUBLIC_PREFIXES = [
  "/sruth",
  "/coming-soon-features",
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
