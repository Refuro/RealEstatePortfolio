import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import {
  buildCspSentryEvent,
  parseCspReportPayload,
  shouldForwardCspReport,
} from "@/lib/csp-report";

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    const payload = JSON.parse(text) as unknown;
    const report = parseCspReportPayload(payload);
    if (!report) {
      return new NextResponse(null, { status: 204 });
    }

    if (process.env.NODE_ENV === "development") {
      console.warn("[CSP violation report]", JSON.stringify(payload));
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
  return new NextResponse(null, { status: 204 });
}
