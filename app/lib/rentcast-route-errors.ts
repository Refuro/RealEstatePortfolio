import { NextResponse } from "next/server";

/**
 * Standard JSON + HTTP codes for RentCast-backed routes (value/rent estimates + benchmark refresh).
 * Quota (429): only counts successful upstream calls — see route handlers.
 */
export const RentCastErrorCodes = {
  RATE_LIMITED: "RATE_LIMITED",
  SERVICE_NOT_CONFIGURED: "SERVICE_NOT_CONFIGURED",
  UPSTREAM_UNAVAILABLE: "UPSTREAM_UNAVAILABLE",
  NO_DATA: "NO_DATA",
} as const;

export type RentCastErrorCode =
  (typeof RentCastErrorCodes)[keyof typeof RentCastErrorCodes];

export function rentCastErrorResponse(
  error: string,
  status: 422 | 429 | 502 | 503
): NextResponse {
  const code: RentCastErrorCode =
    status === 429
      ? RentCastErrorCodes.RATE_LIMITED
      : status === 503
        ? RentCastErrorCodes.SERVICE_NOT_CONFIGURED
        : status === 422
          ? RentCastErrorCodes.NO_DATA
          : RentCastErrorCodes.UPSTREAM_UNAVAILABLE;
  return NextResponse.json({ error, code }, { status });
}

/**
 * Returns true for RentCast "no data available" responses — cases where the AVM
 * cannot produce an estimate due to sparse comps, unknown address, etc.
 * These are expected business outcomes, not application errors, and should not
 * be reported to Sentry as exceptions.
 */
export function isRentCastNoDataError(message: string): boolean {
  return /insufficient comparables|no comparable|unable to calculate avm|no data available|address not found/i.test(
    message
  );
}
