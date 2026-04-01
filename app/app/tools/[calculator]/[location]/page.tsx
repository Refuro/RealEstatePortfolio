import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalculatorLocationPage } from "@/components/marketing/calculator-location-page";
import {
  buildLocationMetaDescription,
  CALCULATOR_LOCATION_DEFS,
  isCalculatorLocationSlug,
  type CalculatorLocationSlug,
} from "@/lib/marketing/calculator-location-pages";
import { getLocationBySlug, LOCATION_DATA_US_STATES } from "@/lib/marketing/location-data";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

export function generateStaticParams() {
  return LOCATION_DATA_US_STATES.flatMap((loc) =>
    (Object.keys(CALCULATOR_LOCATION_DEFS) as CalculatorLocationSlug[]).map((calculator) => ({
      calculator,
      location: loc.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ calculator: string; location: string }>;
}): Promise<Metadata> {
  const { calculator, location: locationSlug } = await params;
  if (!isCalculatorLocationSlug(calculator)) return {};
  const def = CALCULATOR_LOCATION_DEFS[calculator];
  const loc = getLocationBySlug(locationSlug);
  if (!loc) return {};
  const title = `${def.metaTitleShort} — ${loc.name}`;
  const description = buildLocationMetaDescription(def, loc.name);
  const path = `/tools/${calculator}/${locationSlug}`;
  return {
    title,
    description,
    alternates: { canonical: `${APP_URL}${path}` },
    openGraph: {
      title: `${title} | Veld Portfolio`,
      description,
      url: path,
    },
  };
}

export default async function CalculatorLocationRoutePage({
  params,
}: {
  params: Promise<{ calculator: string; location: string }>;
}) {
  const { calculator, location: locationSlug } = await params;
  if (!isCalculatorLocationSlug(calculator)) notFound();
  const loc = getLocationBySlug(locationSlug);
  if (!loc) notFound();
  return <CalculatorLocationPage calculator={calculator} location={loc} />;
}
