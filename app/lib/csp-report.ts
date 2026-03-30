type UnknownRecord = Record<string, unknown>;

export type NormalizedCspReport = {
  directive: string;
  violatedDirective: string | null;
  disposition: string | null;
  blockedUri: string | null;
  blockedUriGroup: string;
  documentUri: string | null;
  documentPath: string;
  sourceFile: string | null;
  lineNumber: number | null;
  columnNumber: number | null;
  statusCode: number | null;
  originalPolicy: string | null;
  referrer: string | null;
};

export type CspSentryEvent = {
  message: string;
  fingerprint: string[];
  tags: Record<string, string>;
  extra: Record<string, string | number | null>;
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function getString(record: UnknownRecord, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function getNumber(record: UnknownRecord, key: string): number | null {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeDirective(value: string | null): string {
  return (value ?? "unknown").toLowerCase();
}

function getUriScheme(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  return match ? match[1].toLowerCase() : null;
}

function isBrowserExtensionUri(value: string | null): boolean {
  const scheme = getUriScheme(value);
  return (
    scheme === "chrome-extension" ||
    scheme === "moz-extension" ||
    scheme === "safari-extension"
  );
}

function normalizeDocumentPath(value: string | null): string {
  if (!value) return "unknown";
  try {
    const url = new URL(value);
    return url.pathname || "/";
  } catch {
    return value.split("?")[0]?.split("#")[0] || "unknown";
  }
}

function normalizeBlockedUriGroup(value: string | null): string {
  if (!value) return "unknown";

  const lowered = value.toLowerCase();
  if (
    lowered === "inline" ||
    lowered === "eval" ||
    lowered === "self" ||
    lowered === "wasm-eval"
  ) {
    return lowered;
  }
  if (lowered.startsWith("data:")) return "data:";
  if (lowered.startsWith("blob:")) return "blob:";
  if (lowered.startsWith("filesystem:")) return "filesystem:";
  if (isBrowserExtensionUri(lowered)) return "browser-extension";

  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.origin;
    }
    return `${url.protocol}//`;
  } catch {
    return lowered.split("?")[0]?.split("#")[0] || "unknown";
  }
}

export function parseCspReportPayload(payload: unknown): NormalizedCspReport | null {
  const envelope = isRecord(payload) ? payload : null;
  const report = isRecord(envelope?.["csp-report"])
    ? envelope["csp-report"]
    : isRecord(envelope?.body)
      ? envelope.body
      : envelope;

  if (!report) return null;

  const effectiveDirective = normalizeDirective(
    getString(report, "effective-directive") ?? getString(report, "violated-directive")
  );
  const blockedUri = getString(report, "blocked-uri");
  const documentUri = getString(report, "document-uri");

  return {
    directive: effectiveDirective,
    violatedDirective: getString(report, "violated-directive"),
    disposition: getString(report, "disposition"),
    blockedUri,
    blockedUriGroup: normalizeBlockedUriGroup(blockedUri),
    documentUri,
    documentPath: normalizeDocumentPath(documentUri),
    sourceFile: getString(report, "source-file"),
    lineNumber: getNumber(report, "line-number"),
    columnNumber: getNumber(report, "column-number"),
    statusCode: getNumber(report, "status-code"),
    originalPolicy: getString(report, "original-policy"),
    referrer: getString(report, "referrer"),
  };
}

export function isIgnorableCspReport(report: NormalizedCspReport): boolean {
  return isBrowserExtensionUri(report.blockedUri) || isBrowserExtensionUri(report.documentUri);
}

export function getCspSampleRate(report: NormalizedCspReport): number {
  if (isIgnorableCspReport(report)) return 0;

  if (
    report.directive === "default-src" ||
    report.directive.startsWith("script-src") ||
    report.directive.startsWith("style-src")
  ) {
    return 1;
  }

  if (
    report.directive.startsWith("connect-src") ||
    report.directive.startsWith("img-src") ||
    report.directive.startsWith("font-src")
  ) {
    return 0.25;
  }

  return 0.5;
}

export function shouldForwardCspReport(
  report: NormalizedCspReport,
  randomValue: number = Math.random()
): boolean {
  return randomValue < getCspSampleRate(report);
}

export function buildCspSentryEvent(report: NormalizedCspReport): CspSentryEvent {
  return {
    message: `CSP violation: ${report.directive}`,
    fingerprint: [
      "csp-violation",
      report.directive,
      report.blockedUriGroup,
      report.documentPath,
    ],
    tags: {
      signal: "csp",
      directive: report.directive,
      blocked_uri_group: report.blockedUriGroup,
      disposition: report.disposition ?? "unknown",
    },
    extra: {
      blockedUri: report.blockedUri,
      documentUri: report.documentUri,
      documentPath: report.documentPath,
      violatedDirective: report.violatedDirective,
      sourceFile: report.sourceFile,
      lineNumber: report.lineNumber,
      columnNumber: report.columnNumber,
      statusCode: report.statusCode,
      referrer: report.referrer,
    },
  };
}
