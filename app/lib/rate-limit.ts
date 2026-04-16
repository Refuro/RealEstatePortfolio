import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

/** Per-action limits (requests per hour). Documented in docs/security/security-notes.md and audits. */
export const RATE_LIMITS: Record<string, number> = {
  "properties:create": 20,
  "properties:patch": 60,
  "properties:delete": 60,
  "properties:mortgage-post": 60,
  "properties:mortgage-patch": 60,
  "properties:mortgage-delete": 60,
  "deals:create": 20,
  "deals:patch": 60,
  "deals:delete": 60,
  "admin:tier-patch": 30,
  "import:portfolio": 5,
  "export:portfolio": 15,
  "export:portfolio_summary": 15,
  "account:delete": 5,
  "account:delete-permanent": 3,
  "billing:create-checkout": 10,
  /** Billing sync (GET) — per user; client throttles to ~5 min; server cap prevents abuse. */
  "billing:sync": 60,
  /** Stripe Customer Portal session creation — per user / hour. */
  "billing:portal": 30,
  /** Google Places address autocomplete — per user / hour. */
  "places:autocomplete": 120,
  /** Google Places address details lookup — per user / hour. */
  "places:details": 60,
};

export function getRateLimitIdentifier(userId: string | null, req: NextRequest): string {
  if (userId) return `user:${userId}`;
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
  return `ip:${ip}`;
}

export async function checkRateLimit(
  identifier: string,
  action: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const limit = RATE_LIMITS[action];
  if (!limit) return { allowed: true };

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.apiRateLimitEntry.count({
    where: {
      identifier,
      action,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (count >= limit) {
    return { allowed: false, retryAfter: 3600 };
  }
  return { allowed: true };
}

export async function recordRateLimit(identifier: string, action: string): Promise<void> {
  await prisma.apiRateLimitEntry.create({
    data: { identifier, action },
  });
}
