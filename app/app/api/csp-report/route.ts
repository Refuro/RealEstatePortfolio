import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import {
  buildCspSentryEvent,
  parseCspReportPayload,
  shouldForwardCspReport,
} from "@/lib/csp-report";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  recordRateLimit,
} from "@/lib/rate-limit";

/** Max JSON body size for CSP reports (bytes). Typical browser reports are small (under ~2KB). */
export const CSP_REPORT_MAX_BODY_BYTES = 8192;

export async function POST(request: NextRequest) {
  const identifier = getRateLimitIdentifier(null, request);
  const { allowed } = await checkRateLimit(identifier, "csp-report:post");
  if (!allowed) {
    return new NextResponse(null, { status: 429 });
  }

  const lenHeader = request.headers.get("content-length");
  if (lenHeader) {
    const n = parseInt(lenHeader, 10);
    if (Number.isFinite(n) && n > CSP_REPORT_MAX_BODY_BYTES) {
      return new NextResponse(null, { status: 413 });
    }
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (text.length > CSP_REPORT_MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  try {
    const payload = JSON.parse(text) as unknown;
    const report = parseCspReportPayload(payload);
    if (!report) {
      await recordRateLimit(identifier, "csp-report:post");
      return new NextResponse(null, { status: 204 });
    }

    if (process.env.NODE_ENV === "development") {
      console.warn("[CSP violation report]", JSON.stringify(payload));
      await recordRateLimit(identifier, "csp-report:post");
      return new NextResponse(null, { status: 204 });
    }

    if (
      process.env.NODE_ENV === "production" &&
      process.env.NEXT_PUBLIC_SENTRY_DSN &&
      shouldForwardCspReport(report)
    ) {
      const event = buildCspSentryEvent(report);
      Sentry.withScope((scope) => {
        scope.setLevel("warning");
        scope.setFingerprint(event.fingerprint);
        for (const [key, value] of Object.entries(event.tags)) {
          scope.setTag(key, value);
        }
        scope.setContext("csp_report", event.extra);
        Sentry.captureMessage(event.message);
      });
    }
  } catch {
    /* ignore malformed body */
  }

  await recordRateLimit(identifier, "csp-report:post");
  return new NextResponse(null, { status: 204 });
}
