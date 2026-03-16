import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://veldportfolio.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/properties",
        "/deals",
        "/analyze",
        "/settings",
        "/admin",
        "/api/",
        "/sign-in",
        "/sign-up",
        "/billing/",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
