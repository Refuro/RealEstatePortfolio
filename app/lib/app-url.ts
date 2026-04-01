/**
 * Canonical site origin for sitemap, robots, and metadata.
 * Strips trailing slashes so `${origin}/path` is consistent everywhere.
 */
export function getAppOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_APP_URL || "https://veldportfolio.com").trim();
  const noSlash = raw.replace(/\/+$/, "");
  return noSlash || "https://veldportfolio.com";
}

export function appAbsoluteUrl(path: string): string {
  const origin = getAppOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
}
