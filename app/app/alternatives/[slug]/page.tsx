import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompetitorAlternativePage } from "@/components/marketing/competitor-alternative-page";
import { COMPETITOR_ALTERNATIVES } from "@/lib/marketing/competitor-data";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

export function generateStaticParams() {
  return Object.keys(COMPETITOR_ALTERNATIVES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = COMPETITOR_ALTERNATIVES[slug];
  if (!config) return {};
  const canonical = `${APP_URL}/alternatives/${slug}`;
  return {
    title: config.metaTitle,
    description: config.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      url: `/alternatives/${slug}`,
    },
  };
}

export default async function AlternativePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = COMPETITOR_ALTERNATIVES[slug];
  if (!config) notFound();
  return <CompetitorAlternativePage config={config} />;
}
