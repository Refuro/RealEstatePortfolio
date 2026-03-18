import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  Sentry.captureException(new Error("Sentry test — server-side error (local)"));
  return NextResponse.json({ error: "Test error sent" }, { status: 500 });
}
