import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://veldportfolio.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    {
      url: `${APP_URL}/changelog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.65,
    },
    { url: `${APP_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
