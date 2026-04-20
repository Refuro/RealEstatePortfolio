import { getAppOrigin } from "@/lib/app-url";

/**
 * Single breadcrumb item. `path` is root-relative (e.g. `/alternatives`) and is resolved
 * to an absolute URL against the canonical origin.
 */
export type BreadcrumbItem = {
  name: string;
  path: string;
};

/**
 * Emits BreadcrumbList JSON-LD matching the visible breadcrumb nav on marketing pages.
 * Keep the items in the same order and with the same names as the visible breadcrumb so
 * Google can correlate the two.
 */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const origin = getAppOrigin();
  const payload = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${origin}${item.path}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
