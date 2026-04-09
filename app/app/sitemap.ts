import type { MetadataRoute } from "next";
import { CALCULATOR_LOCATION_SLUGS } from "@/lib/marketing/calculator-location-pages";
import { LOCATION_DATA_US_STATES } from "@/lib/marketing/location-data";
import { getResourceSlugs } from "@/lib/marketing/resource-data";
import { getAppOrigin } from "@/lib/app-url";

const LAST_MODIFIED = new Date("2026-04-09T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const APP_URL = getAppOrigin();
  const toolLocationPages: MetadataRoute.Sitemap = LOCATION_DATA_US_STATES.flatMap((loc) =>
    CALCULATOR_LOCATION_SLUGS.map((calculator) => ({
      url: `${APP_URL}/tools/${calculator}/${loc.slug}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }))
  );

  return [
    { url: APP_URL, lastModified: LAST_MODIFIED, changeFrequency: "weekly", priority: 1 },
    {
      url: `${APP_URL}/investment-property-calculator`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${APP_URL}/tools`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${APP_URL}/tools/brrr`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/tools/str-vs-ltr`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/tools/fix-and-flip`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/tools/cap-rate`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/tools/cash-on-cash`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/tools/wholesale`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/tools/dscr`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/tools/rent-vs-buy`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...toolLocationPages,
    {
      url: `${APP_URL}/alternatives`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/alternatives/stessa`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${APP_URL}/alternatives/rentastic`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${APP_URL}/alternatives/cozy`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${APP_URL}/vs`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${APP_URL}/vs/spreadsheets`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${APP_URL}/vs/excel-rental-property`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${APP_URL}/resources`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...getResourceSlugs().map((slug) => ({
      url: `${APP_URL}/resources/${slug}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${APP_URL}/pricing`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/changelog`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${APP_URL}/privacy`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${APP_URL}/terms`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
