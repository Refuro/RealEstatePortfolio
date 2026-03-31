import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { withSentryConfig } from "@sentry/nextjs";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
const reportUri = baseUrl ? `${baseUrl}/api/csp-report` : "";

// Clerk loads clerk-js from *.clerk.accounts.dev; OAuth/iframes need frame-src; workers need blob:.
// Stripe embedded checkout uses iframes on js.stripe.com / hooks.stripe.com.
// See https://clerk.com/docs/security/clerk-csp — if you use a custom Clerk Frontend API domain, add it to script-src/connect-src/frame-src.
const cspDirectives =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://challenges.cloudflare.com; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: https://img.clerk.com https:; " +
  "font-src 'self' data:; " +
  "connect-src 'self' https:; " +
  "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com https://*.js.stripe.com https://js.stripe.com https://hooks.stripe.com; " +
  "worker-src 'self' blob:; " +
  "frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

const cspValue = reportUri ? `${cspDirectives}; report-uri ${reportUri}` : cspDirectives;

const enforceCsp = process.env.CSP_ENFORCEMENT === "true";

const cspHeaders = enforceCsp
  ? [{ key: "Content-Security-Policy", value: cspValue }]
  : [{ key: "Content-Security-Policy-Report-Only", value: cspValue }];

/** Next.js app directory (…/RealEstatePortfolio/app). Fixes Turbopack resolving deps from the parent Husky root when multiple lockfiles exist. */
const appDir = path.dirname(fileURLToPath(import.meta.url));

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  ...cspHeaders,
];

const nextConfig: NextConfig = {
  // Must match `turbopack.root` (Next warns if they differ). Same intent: trace from app package root in a multi-lockfile layout.
  outputFileTracingRoot: appDir,
  turbopack: {
    root: appDir,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG ?? "placeholder-org",
  project: process.env.SENTRY_PROJECT ?? "placeholder-project",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
});
