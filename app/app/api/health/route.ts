import { NextResponse } from "next/server";

/**
 * Lightweight health check for uptime monitors.
 * No DB query — avoids keeping Neon compute alive between pings.
 */
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
