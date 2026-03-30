import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
const reportUri = baseUrl ? `${baseUrl}/api/csp-report` : "";

const cspDirectives =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

const cspValue = reportUri ? `${cspDirectives}; report-uri ${reportUri}` : cspDirectives;

const enforceCsp = process.env.CSP_ENFORCEMENT === "true";

const cspHeaders = enforceCsp
  ? [{ key: "Content-Security-Policy", value: cspValue }]
  : [{ key: "Content-Security-Policy-Report-Only", value: cspValue }];

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
