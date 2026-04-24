import type { MetadataRoute } from "next";
import {
  CALCULATOR_LOCATION_DEFS,
  CALCULATOR_LOCATION_SLUGS,
} from "@/lib/marketing/calculator-location-pages";
import { LOCATION_DATA_US_STATES } from "@/lib/marketing/location-data";
import { getResourceSlugs } from "@/lib/marketing/resource-data";
import {
  COMPETITOR_ALTERNATIVES,
  COMPETITOR_VS,
} from "@/lib/marketing/competitor-data";
import { CHANGELOG_ENTRIES } from "@/lib/changelog-data";
import { getAppOrigin } from "@/lib/app-url";

/**
 * Latest changelog date — serves as the most recent content activity signal for the
 * site. Used as the lastModified for evergreen marketing surfaces that do not yet have
 * per-URL timestamps.
 */
function latestChangelogDate(): Date {
  const dates = CHANGELOG_ENTRIES.map((entry) => new Date(`${entry.date}T00:00:00.000Z`));
  return dates.reduce<Date>(
    (acc, d) => (d.getTime() > acc.getTime() ? d : acc),
    new Date(0)
  );
}

/** Stable date for legal surfaces that rarely change — bump manually when content changes. */
const LEGAL_LAST_MODIFIED = new Date("2026-04-09T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const APP_URL = getAppOrigin();
  const SITE_LAST_MODIFIED = latestChangelogDate();

  const toolLocationPages: MetadataRoute.Sitemap = LOCATION_DATA_US_STATES.flatMap((loc) =>
    CALCULATOR_LOCATION_SLUGS.map((calculator) => ({
      url: `${APP_URL}/tools/${calculator}/${loc.slug}`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }))
  );

  // Calculator base pages are derived from CALCULATOR_LOCATION_DEFS so new calculators
  // added to that data file automatically appear in the sitemap without edits here.
  // The `investment-property` calculator is the flagship (top-level path) and gets a
  // slightly higher priority than the eight /tools/* variants.
  const calculatorBasePages: MetadataRoute.Sitemap = Object.values(CALCULATOR_LOCATION_DEFS).map(
    (def) => ({
      url: `${APP_URL}${def.basePath}`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "weekly" as const,
      priority: def.slug === "investment-property" ? 0.85 : 0.8,
    })
  );

  const alternativePages: MetadataRoute.Sitemap = Object.keys(COMPETITOR_ALTERNATIVES).map(
    (slug) => ({
      url: `${APP_URL}/alternatives/${slug}`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })
  );

  const vsPages: MetadataRoute.Sitemap = Object.keys(COMPETITOR_VS).map((slug) => ({
    url: `${APP_URL}/vs/${slug}`,
    lastModified: SITE_LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const resourcePages: MetadataRoute.Sitemap = getResourceSlugs().map((slug) => ({
    url: `${APP_URL}/resources/${slug}`,
    lastModified: SITE_LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    { url: APP_URL, lastModified: SITE_LAST_MODIFIED, changeFrequency: "weekly", priority: 1 },
    {
      url: `${APP_URL}/tools`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...calculatorBasePages,
    ...toolLocationPages,
    {
      url: `${APP_URL}/alternatives`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...alternativePages,
    {
      url: `${APP_URL}/vs`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...vsPages,
    {
      url: `${APP_URL}/resources`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...resourcePages,
    {
      url: `${APP_URL}/pricing`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/changelog`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${APP_URL}/about`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.68,
    },
    {
      url: `${APP_URL}/privacy`,
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/terms`,
      lastModified: LEGAL_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
