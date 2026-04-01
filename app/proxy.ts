import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Next.js 16+ uses proxy.ts (not middleware.ts) for the network boundary.
 * This file is the auth proxy: protects non-public routes via Clerk.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy",
  "/terms",
  "/pricing",
  "/investment-property-calculator",
  "/tools(.*)", // hub, /tools/brrr, /tools/str-vs-ltr, /tools/fix-and-flip, …
  "/lp/investment-property-calculator",
  "/changelog",
  "/contact",
  "/api/billing/webhook",
  "/api/contact",
  "/api/csp-report",
  "/api/health",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|woff2?|ttf|otf)).*)",
    "/(api|trpc)(.*)",
  ],
};
