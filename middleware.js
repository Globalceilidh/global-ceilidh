import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// COMING SOON MODE — flip to false when site is ready to open
const COMING_SOON = true;

export default clerkMiddleware((auth, request) => {
  if (COMING_SOON) {
    const { pathname } = request.nextUrl;

    // Allow: homepage, API routes, Next.js internals, static files, webhooks
    const allowed =
      pathname === '/' ||
      pathname === '/sruth' ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon') ||
      pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf)$/);

    if (!allowed) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
