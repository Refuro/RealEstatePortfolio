import { describe, expect, it } from "vitest";
import {
  buildCspSentryEvent,
  getCspSampleRate,
  isIgnorableCspReport,
  parseCspReportPayload,
  shouldForwardCspReport,
} from "./csp-report";

describe("csp-report helpers", () => {
  it("parses report-uri style payloads into normalized fields", () => {
    const parsed = parseCspReportPayload({
      "csp-report": {
        "effective-directive": "script-src-elem",
        "violated-directive": "script-src-elem",
        "blocked-uri": "https://cdn.example.com/tracker.js?cache=1",
        "document-uri": "https://veldportfolio.com/pricing?plan=pro",
        "source-file": "https://veldportfolio.com/_next/static/chunk.js",
        "line-number": 42,
        "column-number": 7,
        "status-code": 200,
        disposition: "report",
      },
    });

    expect(parsed).toEqual({
      directive: "script-src-elem",
      violatedDirective: "script-src-elem",
      disposition: "report",
      blockedUri: "https://cdn.example.com/tracker.js?cache=1",
      blockedUriGroup: "https://cdn.example.com",
      documentUri: "https://veldportfolio.com/pricing?plan=pro",
      documentPath: "/pricing",
      sourceFile: "https://veldportfolio.com/_next/static/chunk.js",
      lineNumber: 42,
      columnNumber: 7,
      statusCode: 200,
      originalPolicy: null,
      referrer: null,
    });
  });

  it("treats browser-extension reports as ignorable noise", () => {
    const parsed = parseCspReportPayload({
      "csp-report": {
        "effective-directive": "script-src",
        "blocked-uri": "chrome-extension://abcdef/script.js",
        "document-uri": "https://veldportfolio.com/dashboard",
      },
    });

    expect(parsed).not.toBeNull();
    expect(isIgnorableCspReport(parsed!)).toBe(true);
    expect(getCspSampleRate(parsed!)).toBe(0);
    expect(shouldForwardCspReport(parsed!, 0)).toBe(false);
  });

  it("treats source-file label chrome-extension as ignorable", () => {
    const parsed = parseCspReportPayload({
      "csp-report": {
        "effective-directive": "script-src-elem",
        "blocked-uri": "https://apis.google.com/js/client.js",
        "document-uri": "https://veldportfolio.com/",
        "source-file": "chrome-extension",
      },
    });

    expect(parsed).not.toBeNull();
    expect(isIgnorableCspReport(parsed!)).toBe(true);
    expect(shouldForwardCspReport(parsed!, 0.99)).toBe(false);
  });

  it("treats blocked apis.google.com gapi as ignorable (extension-injected)", () => {
    const parsed = parseCspReportPayload({
      "csp-report": {
        "effective-directive": "script-src-elem",
        "blocked-uri": "https://apis.google.com/js/client.js?onload=callback",
        "document-uri": "https://veldportfolio.com/changelog",
        "source-file": "https://apis.google.com/js/client.js",
      },
    });

    expect(parsed).not.toBeNull();
    expect(isIgnorableCspReport(parsed!)).toBe(true);
    expect(shouldForwardCspReport(parsed!, 0.99)).toBe(false);
  });

  it("samples lower-priority directives while always keeping script/style violations", () => {
    const scriptReport = parseCspReportPayload({
      "csp-report": {
        "effective-directive": "script-src",
        "blocked-uri": "inline",
        "document-uri": "https://veldportfolio.com/dashboard",
      },
    });
    const connectReport = parseCspReportPayload({
      "csp-report": {
        "effective-directive": "connect-src",
        "blocked-uri": "https://api.third-party.com/v1",
        "document-uri": "https://veldportfolio.com/dashboard",
      },
    });

    expect(scriptReport).not.toBeNull();
    expect(connectReport).not.toBeNull();
    expect(getCspSampleRate(scriptReport!)).toBe(1);
    expect(getCspSampleRate(connectReport!)).toBe(0.25);
    expect(shouldForwardCspReport(scriptReport!, 0.99)).toBe(true);
    expect(shouldForwardCspReport(connectReport!, 0.3)).toBe(false);
    expect(shouldForwardCspReport(connectReport!, 0.2)).toBe(true);
  });

  it("builds stable Sentry grouping metadata", () => {
    const report = parseCspReportPayload({
      body: {
        "effective-directive": "img-src",
        "blocked-uri": "data:image/png;base64,abc",
        "document-uri": "https://veldportfolio.com/properties/123?tab=overview",
      },
    });

    expect(report).not.toBeNull();
    expect(buildCspSentryEvent(report!)).toEqual({
      message: "CSP violation: img-src",
      fingerprint: ["csp-violation", "img-src", "data:", "/properties/123"],
      tags: {
        signal: "csp",
        directive: "img-src",
        blocked_uri_group: "data:",
        disposition: "unknown",
      },
      extra: {
        blockedUri: "data:image/png;base64,abc",
        documentUri: "https://veldportfolio.com/properties/123?tab=overview",
        documentPath: "/properties/123",
        violatedDirective: null,
        sourceFile: null,
        lineNumber: null,
        columnNumber: null,
        statusCode: null,
        referrer: null,
      },
    });
  });
});
