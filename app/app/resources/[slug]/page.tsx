import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResourceArticlePage } from "@/components/marketing/resource-article-page";
import { getResourceArticle, getResourceSlugs } from "@/lib/marketing/resource-data";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

export function generateStaticParams() {
  return getResourceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getResourceArticle(slug);
  if (!article) return {};
  const path = `/resources/${slug}`;
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: `${APP_URL}${path}` },
    openGraph: {
      title: `${article.metaTitle} | Veld Portfolio`,
      description: article.metaDescription,
      url: path,
    },
  };
}

export default async function ResourceSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getResourceArticle(slug);
  if (!article) notFound();
  return <ResourceArticlePage article={article} />;
}
