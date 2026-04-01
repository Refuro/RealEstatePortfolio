import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://veldportfolio.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/analyze",
        "/api/",
        "/billing/",
        "/calculators",
        "/dashboard",
        "/deals",
        "/export",
        "/modeling",
        "/mortgage",
        "/plans",
        "/properties",
        "/settings",
        "/sign-in",
        "/sign-up",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
