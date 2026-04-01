import type { MetadataRoute } from "next";
import { getAppOrigin } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  const APP_URL = getAppOrigin();
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
