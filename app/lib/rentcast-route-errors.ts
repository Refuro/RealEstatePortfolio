import { NextResponse } from "next/server";

/**
 * Standard JSON + HTTP codes for RentCast-backed routes (value/rent estimates + benchmark refresh).
 * Quota (429): only counts successful upstream calls — see route handlers.
 */
export const RentCastErrorCodes = {
  RATE_LIMITED: "RATE_LIMITED",
  SERVICE_NOT_CONFIGURED: "SERVICE_NOT_CONFIGURED",
  UPSTREAM_UNAVAILABLE: "UPSTREAM_UNAVAILABLE",
} as const;

export type RentCastErrorCode =
  (typeof RentCastErrorCodes)[keyof typeof RentCastErrorCodes];

export function rentCastErrorResponse(
  error: string,
  status: 429 | 502 | 503
): NextResponse {
  const code: RentCastErrorCode =
    status === 429
      ? RentCastErrorCodes.RATE_LIMITED
      : status === 503
        ? RentCastErrorCodes.SERVICE_NOT_CONFIGURED
        : RentCastErrorCodes.UPSTREAM_UNAVAILABLE;
  return NextResponse.json({ error, code }, { status });
}
