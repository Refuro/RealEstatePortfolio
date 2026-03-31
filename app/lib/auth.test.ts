import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// auth.ts imports @/lib/db, which runs validateEnv() on load. GitHub Actions
// does not have DATABASE_URL / Clerk / Stripe (Vercel does). Mock DB so isAdmin
// tests never load db.ts — same idea as app route tests that vi.mock @/lib/db.
vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { isAdmin } from "./auth";

describe("isAdmin", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_EMAILS", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns false when ADMIN_EMAILS is unset or empty", () => {
    expect(isAdmin({ email: "owner@example.com" })).toBe(false);
  });

  it("returns true when user email matches a listed admin (case-insensitive)", () => {
    vi.stubEnv("ADMIN_EMAILS", "owner@example.com, other@site.org");
    expect(isAdmin({ email: "Owner@example.com" })).toBe(true);
    expect(isAdmin({ email: "OTHER@site.org" })).toBe(true);
  });

  it("returns false when email is not in the list", () => {
    vi.stubEnv("ADMIN_EMAILS", "only@here.com");
    expect(isAdmin({ email: "not@here.com" })).toBe(false);
  });

  it("returns false for empty user email when list is set", () => {
    vi.stubEnv("ADMIN_EMAILS", "a@b.com");
    expect(isAdmin({ email: "" })).toBe(false);
  });
});
