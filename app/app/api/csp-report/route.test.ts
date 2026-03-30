import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { sentryMock, scopeMock } = vi.hoisted(() => {
  const scopeMock = {
    setLevel: vi.fn(),
    setFingerprint: vi.fn(),
    setTag: vi.fn(),
    setContext: vi.fn(),
  };

  const sentryMock = {
    withScope: vi.fn((callback: (scope: typeof scopeMock) => void) => callback(scopeMock)),
    captureMessage: vi.fn(),
  };

  return { sentryMock, scopeMock };
});

vi.mock("@sentry/nextjs", () => sentryMock);

function postRequest(payload: unknown) {
  return new NextRequest("http://localhost/api/csp-report", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: { "content-type": "application/csp-report" },
  });
}

describe("POST /api/csp-report", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("logs in development without forwarding to Sentry", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { POST } = await import("./route");

    const response = await POST(
      postRequest({
        "csp-report": {
          "effective-directive": "script-src",
          "blocked-uri": "inline",
          "document-uri": "http://localhost:3000/pricing",
        },
      })
    );

    expect(response.status).toBe(204);
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(sentryMock.captureMessage).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it("forwards production violations to Sentry when configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://public@example.ingest.sentry.io/1");
    const { POST } = await import("./route");

    const response = await POST(
      postRequest({
        "csp-report": {
          "effective-directive": "script-src",
          "blocked-uri": "inline",
          "document-uri": "https://veldportfolio.com/pricing",
          disposition: "enforce",
        },
      })
    );

    expect(response.status).toBe(204);
    expect(sentryMock.withScope).toHaveBeenCalledOnce();
    expect(scopeMock.setLevel).toHaveBeenCalledWith("warning");
    expect(scopeMock.setFingerprint).toHaveBeenCalledWith([
      "csp-violation",
      "script-src",
      "inline",
      "/pricing",
    ]);
    expect(scopeMock.setTag).toHaveBeenCalledWith("signal", "csp");
    expect(sentryMock.captureMessage).toHaveBeenCalledWith("CSP violation: script-src");
  });
});
