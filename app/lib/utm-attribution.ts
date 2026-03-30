const STORAGE_KEY = "veld_utm_attribution_v1";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

type StoredUtm = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  updated_at: number;
};

function normalize(raw: string | null): string | undefined {
  if (!raw) return undefined;
  const v = raw.trim();
  return v.length > 0 ? v : undefined;
}

function readRaw(): StoredUtm | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUtm;
    if (!parsed || typeof parsed.updated_at !== "number") return null;
    if (Date.now() - parsed.updated_at > TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeRaw(payload: StoredUtm): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore storage quota/private mode */
  }
}

/**
 * Persist UTM params from URL for later signup/activation attribution.
 */
export function syncUtmFromSearchParams(searchParams: URLSearchParams): void {
  const utm_source = normalize(searchParams.get("utm_source"));
  const utm_medium = normalize(searchParams.get("utm_medium"));
  const utm_campaign = normalize(searchParams.get("utm_campaign"));
  const utm_content = normalize(searchParams.get("utm_content"));
  if (!utm_source && !utm_medium && !utm_campaign && !utm_content) return;

  const existing = readRaw();
  writeRaw({
    utm_source: utm_source ?? existing?.utm_source,
    utm_medium: utm_medium ?? existing?.utm_medium,
    utm_campaign: utm_campaign ?? existing?.utm_campaign,
    utm_content: utm_content ?? existing?.utm_content,
    updated_at: Date.now(),
  });
}

export function getUtmForAnalytics(): Record<string, string> {
  const row = readRaw();
  if (!row) return {};
  const payload: Record<string, string> = {};
  if (row.utm_source) payload.utm_source = row.utm_source;
  if (row.utm_medium) payload.utm_medium = row.utm_medium;
  if (row.utm_campaign) payload.utm_campaign = row.utm_campaign;
  if (row.utm_content) payload.utm_content = row.utm_content;
  return payload;
}
