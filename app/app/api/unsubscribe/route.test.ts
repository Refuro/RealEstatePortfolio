import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => {
  const prismaMock = {
    user: {
      update: vi.fn(),
    },
  };
  return { prismaMock };
});

const { verifyUnsubscribeTokenMock } = vi.hoisted(() => ({
  verifyUnsubscribeTokenMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

vi.mock("@/lib/emails/onboarding-reengagement", () => ({
  verifyUnsubscribeToken: (...args: unknown[]) => verifyUnsubscribeTokenMock(...args),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

function makeRequest(url: string) {
  return new NextRequest(url, { method: "GET" });
}

describe("GET /api/unsubscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    verifyUnsubscribeTokenMock.mockReturnValue(true);
    prismaMock.user.update.mockResolvedValue({} as never);
  });

  it("returns 400 when token is missing", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("http://localhost/api/unsubscribe?userId=user-1"));
    expect(res.status).toBe(400);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("returns 400 when token is invalid", async () => {
    verifyUnsubscribeTokenMock.mockReturnValue(false);
    const { GET } = await import("./route");
    const res = await GET(
      makeRequest("http://localhost/api/unsubscribe?userId=user-1&token=bad")
    );
    expect(res.status).toBe(400);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("returns 200 and sets onboardingEmailsOptedOutAt when token is valid", async () => {
    const { GET } = await import("./route");
    const res = await GET(
      makeRequest("http://localhost/api/unsubscribe?userId=user-1&token=good")
    );
    expect(res.status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        onboardingEmailsOptedOutAt: expect.any(Date),
      },
    });
    const html = await res.text();
    expect(html).toContain("You have been unsubscribed");
  });

  it("returns 400 when token has wrong length (malformed)", async () => {
    verifyUnsubscribeTokenMock.mockReturnValue(false);
    const { GET } = await import("./route");
    const res = await GET(
      makeRequest("http://localhost/api/unsubscribe?userId=user-1&token=short")
    );
    expect(res.status).toBe(400);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("returns 200 on a second call (idempotent)", async () => {
    const { GET } = await import("./route");

    const first = await GET(
      makeRequest("http://localhost/api/unsubscribe?userId=user-1&token=good")
    );
    const second = await GET(
      makeRequest("http://localhost/api/unsubscribe?userId=user-1&token=good")
    );

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenCalledTimes(2);
  });
});
