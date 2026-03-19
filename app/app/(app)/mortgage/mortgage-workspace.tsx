"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MortgageForTabs } from "../properties/[id]/property-detail-tabs";

const MortgageTabContent = dynamic(
  () =>
    import("../properties/[id]/mortgage-tab-content").then((m) => ({
      default: m.MortgageTabContent,
    })),
  { ssr: false }
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
      <div className="rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Mortgage</h1>
            <p className="mt-1 text-sm text-muted">
              Run mortgage payoff simulations in a global workspace.
            </p>
            {selectedProperty && (
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                <span>Active property:</span>
                <span className="rounded-full border border-border/70 bg-background/60 px-2.5 py-0.5 font-medium text-foreground">
                  {selectedPropertyLabel}
                </span>
                <span className="rounded-full border border-border/60 bg-background/50 px-2 py-0.5 text-xs text-muted">
                  {totalMortgages} {totalMortgages === 1 ? "mortgage" : "mortgages"}
                </span>
              </p>
            )}
          </div>
          <label className="w-full text-xs font-medium uppercase tracking-wide text-muted lg:w-80">
            Mortgage context
            <select
              value={selectedProperty?.id ?? ""}
              onChange={(e) => {
                const nextPropertyId = e.target.value;
                setSelectedPropertyId(nextPropertyId);
                syncMortgageWorkspaceQuery(nextPropertyId, null);
              }}
              disabled={properties.length <= 1}
              className="mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {getPropertyLabel(property)}
                </option>
              ))}
            </select>
            {properties.length <= 1 && (
              <span className="mt-1 block text-xs normal-case tracking-normal text-muted">
                Add more properties to switch context here.
              </span>
            )}
          </label>
        </div>
        {selectedProperty && selectedProperty.mortgages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            <Link
              href={`/properties/${selectedProperty.id}`}
              className="text-muted hover:text-foreground hover:underline"
            >
              Open property detail
            </Link>
            <span className="text-muted">•</span>
            <Link
              href={`/properties/${selectedProperty.id}?tab=details#mortgages`}
              className="text-muted hover:text-foreground hover:underline"
            >
              Edit mortgage details
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
