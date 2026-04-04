"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { MortgageForTabs } from "../properties/[id]/property-detail-tabs";

const MortgageTabContent = dynamic(
  () =>
    import("../properties/[id]/mortgage-tab-content").then((m) => ({
      default: m.MortgageTabContent,
    })),
  {
    ssr: false,
    loading: () => (
      <p className="p-4 text-sm text-muted">Loading mortgage workspace…</p>
    ),
  }
);

type MortgageProperty = {
  id: string;
  nickname: string | null;
  addressLine1: string;
  mortgages: MortgageForTabs[];
};

function getPropertyLabel(property: MortgageProperty): string {
  return property.nickname?.trim() || property.addressLine1;
}

function getDefaultPropertyId(properties: MortgageProperty[]): string {
  return properties.find((property) => property.mortgages.length > 0)?.id ?? properties[0]?.id ?? "";
}

function syncMortgageWorkspaceQuery(propertyId: string, mortgageId?: string | null) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("propertyId", propertyId);
  if (mortgageId) {
    url.searchParams.set("mortgageId", mortgageId);
  } else {
    url.searchParams.delete("mortgageId");
  }
  window.history.replaceState(window.history.state, "", url.toString());
}

export function MortgageWorkspace({
  properties,
  initialSelectedPropertyId,
  initialSelectedMortgageId,
}: {
  properties: MortgageProperty[];
  initialSelectedPropertyId?: string;
  initialSelectedMortgageId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mortgageIdFromUrl = searchParams.get("mortgageId");
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    initialSelectedPropertyId &&
      properties.some((property) => property.id === initialSelectedPropertyId)
      ? initialSelectedPropertyId
      : getDefaultPropertyId(properties)
  );

  const selectedProperty = useMemo(
    () =>
      properties.find((property) => property.id === selectedPropertyId) ??
      properties.find((property) => property.mortgages.length > 0) ??
      properties[0] ??
      null,
    [properties, selectedPropertyId]
  );
  const selectedPropertyLabel = selectedProperty ? getPropertyLabel(selectedProperty) : "";
  const totalMortgages = selectedProperty?.mortgages.length ?? 0;
  const mobileHeader = selectedProperty ? (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-muted">
            Active property
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{selectedPropertyLabel}</p>
        </div>
        <span className="rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-xs text-muted">
          {totalMortgages} {totalMortgages === 1 ? "mortgage" : "mortgages"}
        </span>
      </div>
      <label className="block text-xs font-medium text-muted">
        Mortgage context
        <select
          value={selectedProperty.id}
          onChange={(e) => {
            const nextPropertyId = e.target.value;
            setSelectedPropertyId(nextPropertyId);
            syncMortgageWorkspaceQuery(nextPropertyId, null);
          }}
          disabled={properties.length <= 1}
          className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {getPropertyLabel(property)}
            </option>
          ))}
        </select>
      </label>
      {selectedProperty.mortgages.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Link
            href={`/properties/${selectedProperty.id}`}
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
          >
            <ChevronRight className="size-3.5" aria-hidden />
            Open property detail
          </Link>
          <Link
            href={`/properties/${selectedProperty.id}?tab=details#mortgages`}
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
          >
            <ChevronRight className="size-3.5" aria-hidden />
            Edit mortgage details
          </Link>
          <Link
            href={
              mortgageIdFromUrl
                ? `/refinance?propertyId=${encodeURIComponent(selectedProperty.id)}&mortgageId=${encodeURIComponent(mortgageIdFromUrl)}`
                : `/refinance?propertyId=${encodeURIComponent(selectedProperty.id)}`
            }
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
          >
            <ChevronRight className="size-3.5" aria-hidden />
            Refinance comparison
          </Link>
        </div>
      )}
    </div>
  ) : null;

  if (properties.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Mortgage</h1>
        <p className="mt-2 text-base text-muted">
          Explore payoff and mortgage projection tools from one place.
        </p>
        <div className="mt-8 rounded-xl border border-border/70 bg-card/95 p-8 text-center shadow-sm">
          <h2 className="text-lg font-medium text-foreground">
            Add your first property to start mortgage modeling
          </h2>
          <p className="mt-2 text-base text-muted">
            Once properties exist, this workspace helps you compare payoff scenarios.
          </p>
          <Link
            href="/properties/new"
            className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Add your first property
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Mortgage</h1>
      <div className="mt-4 hidden md:block">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">
              Run mortgage payoff simulations in a global workspace.
            </p>
            {selectedProperty && (
              <span className="mt-1.5 inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted shadow-sm">
                  {totalMortgages} {totalMortgages === 1 ? "mortgage" : "mortgages"}
              </span>
            )}
          </div>
          <label className="block w-full text-xs font-medium text-muted lg:w-80">
            Property
            <select
              value={selectedProperty?.id ?? ""}
              onChange={(e) => {
                const nextPropertyId = e.target.value;
                setSelectedPropertyId(nextPropertyId);
                syncMortgageWorkspaceQuery(nextPropertyId, null);
              }}
              disabled={properties.length <= 1}
              className="mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {getPropertyLabel(property)}
                </option>
              ))}
            </select>
            {properties.length <= 1 && (
              <span className="mt-1 block text-xs text-muted">
                Add more properties to switch context here.
              </span>
            )}
          </label>
        </div>
        {selectedProperty && selectedProperty.mortgages.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <Link
              href={`/properties/${selectedProperty.id}`}
              className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
            >
              <ChevronRight className="size-3.5" aria-hidden />
              Open property detail
            </Link>
            <Link
              href={`/properties/${selectedProperty.id}?tab=details#mortgages`}
              className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
            >
              <ChevronRight className="size-3.5" aria-hidden />
              Edit mortgage details
            </Link>
            <Link
              href={
                mortgageIdFromUrl
                  ? `/refinance?propertyId=${encodeURIComponent(selectedProperty.id)}&mortgageId=${encodeURIComponent(mortgageIdFromUrl)}`
                  : `/refinance?propertyId=${encodeURIComponent(selectedProperty.id)}`
              }
              className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
            >
              <ChevronRight className="size-3.5" aria-hidden />
              Refinance comparison
            </Link>
          </div>
        )}
      </div>

      {selectedProperty && selectedProperty.mortgages.length > 0 ? (
        <>
          <div className="mt-4">
            <MortgageTabContent
              key={selectedProperty.id}
              propertyId={selectedProperty.id}
              mortgageData={selectedProperty.mortgages}
              workspaceVariant="workspace"
              mobileHeader={mobileHeader}
              initialSelectedMortgageId={
                initialSelectedMortgageId &&
                selectedProperty.mortgages.some((mortgage) => mortgage.id === initialSelectedMortgageId)
                  ? initialSelectedMortgageId
                  : undefined
              }
              onNavigateToDetails={() => {
                router.push(`/properties/${selectedProperty.id}?tab=details#mortgages`);
              }}
              onSelectedMortgageChange={(mortgageId) => {
                syncMortgageWorkspaceQuery(selectedProperty.id, mortgageId);
              }}
            />
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-border/70 bg-card/95 p-8 shadow-sm">
          <h2 className="text-lg font-medium text-foreground">
            No mortgage found for this property
          </h2>
          <p className="mt-2 text-base text-muted">
            Add mortgage details to unlock payoff simulation for this property.
          </p>
          {selectedProperty && (
            <Link
              href={`/properties/${selectedProperty.id}?tab=details#mortgages`}
              className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-foreground hover:bg-accent-hover"
            >
              Add mortgage details
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
