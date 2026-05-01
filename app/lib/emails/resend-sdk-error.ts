/**
 * Resend Node SDK surfaces API failures as a plain object, not Error.
 *
 * Matches `ErrorResponse` in `resend` / resend-node:
 * https://github.com/resend/resend-node/blob/canary/src/interfaces.ts
 */
export type ResendSdkError = {
  message: string;
  name: string;
  statusCode: number | null;
};

export function parseResendSdkError(error: unknown): ResendSdkError | null {
  if (!error || typeof error !== "object") return null;
  const o = error as Record<string, unknown>;
  if (typeof o.message !== "string") return null;
  return {
    message: o.message,
    name: typeof o.name === "string" ? o.name : "unknown_error_code",
    statusCode:
      typeof o.statusCode === "number" || o.statusCode === null
        ? (o.statusCode as number | null)
        : null,
  };
}

/** Use when passing Resend `{ error }` into Sentry (avoids `[object Object]`). */
export function errorFromResendSdk(error: unknown): Error {
  if (error instanceof Error) return error;
  const parsed = parseResendSdkError(error);
  if (parsed) {
    const http =
      parsed.statusCode != null ? ` (HTTP ${parsed.statusCode})` : "";
    return new Error(`${parsed.message} [${parsed.name}]${http}`);
  }
  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}

/** Structured fields for Sentry `extra` (queryable beside the Error message). */
export function resendSdkErrorExtra(
  error: unknown
): Record<string, string | number | null> | undefined {
  const parsed = parseResendSdkError(error);
  if (!parsed) return undefined;
  return {
    resend_message: parsed.message,
    resend_name: parsed.name,
    resend_status_code: parsed.statusCode,
  };
}
