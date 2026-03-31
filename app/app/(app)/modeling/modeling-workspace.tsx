"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { MortgageForTabs } from "../properties/[id]/property-detail-tabs";
import type { OwnershipDisplayMode } from "@/lib/metrics/property-metrics";

const ProjectionsTabContent = dynamic(
  () =>
    import("../properties/[id]/projections-tab-content").then((m) => ({
      default: m.ProjectionsTabContent,
    })),
  {
    ssr: false,
    loading: () => (
      <p className="p-4 text-sm text-muted">Loading projections…</p>
    ),
  }
);

type ModelingProperty = {
  id: string;
  nickname: string | null;
  addressLine1: string;
  propertyType: string;
  units: number;
  monthlyRent: number;
  monthlyExpenses: number;
  currentEstimatedValue: number;
  cashInvested: number | null;
  ownershipPercent: number;
  vacancyPercent: number;
  mortgageCount: number;
  mortgageData: MortgageForTabs[];
};

function getPropertyLabel(property: ModelingProperty): string {
  return property.nickname?.trim() || property.addressLine1;
}

export function ModelingWorkspace({
  properties,
  initialSelectedPropertyId,
  displayMode,
}: {
  properties: ModelingProperty[];
  initialSelectedPropertyId?: string;
  displayMode: OwnershipDisplayMode;
}) {
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    initialSelectedPropertyId && properties.some((property) => property.id === initialSelectedPropertyId)
      ? initialSelectedPropertyId
      : properties[0]?.id ?? ""
  );

  const selectedProperty = useMemo(
    () => properties.find((p) => p.id === selectedPropertyId) ?? properties[0] ?? null,
    [properties, selectedPropertyId]
  );

  const selectedMortgageTotals = useMemo(() => {
    if (!selectedProperty) {
      return { totalBalance: 0, totalPayment: 0 };
    }
    return selectedProperty.mortgageData.reduce(
      (sum, mortgage) => ({
        totalBalance: sum.totalBalance + Number(mortgage.effectiveBalance ?? Number(mortgage.currentBalance)),
        totalPayment: sum.totalPayment + Number(mortgage.monthlyPayment),
      }),
      { totalBalance: 0, totalPayment: 0 }
    );
  }, [selectedProperty]);

  const selectedPropertyLabel = selectedProperty ? getPropertyLabel(selectedProperty) : "";
  const mobileHeader = selectedProperty ? (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          Active property
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">{selectedPropertyLabel}</p>
      </div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
        Modeling context
        <select
          value={selectedProperty.id}
          onChange={(e) => setSelectedPropertyId(e.target.value)}
          disabled={properties.length <= 1}
          className="mt-1.5 block w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm normal-case tracking-normal text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {getPropertyLabel(property)}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href={`/properties/${selectedProperty.id}`}
          className="rounded-xl border border-border bg-background px-3 py-2 font-medium text-foreground hover:bg-subtle"
        >
          Open property detail
        </Link>
      </div>
    </div>
  ) : null;

  if (properties.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Modeling</h1>
        <p className="mt-2 text-base text-muted">
          Run portfolio-style what-if scenarios from one place.
        </p>
        <div className="mt-8 rounded-xl border border-border/70 bg-card/95 p-8 text-center shadow-sm">
          <h2 className="text-lg font-medium text-foreground">
            Add your first property to start modeling
          </h2>
          <p className="mt-2 text-base text-muted">
            Once a property exists, you can run rent, value, and debt assumptions here.
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
      <div className="hidden rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm md:block">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Modeling</h1>
            <p className="mt-1 text-sm text-muted">
              Run scenario assumptions in a global workspace.
            </p>
            {selectedProperty && properties.length <= 1 && (
              <p className="mt-2 text-sm text-muted">
                Active property:{" "}
                <span className="rounded-full border border-border/70 bg-background/60 px-2.5 py-0.5 font-medium text-foreground">
                  {selectedPropertyLabel}
                </span>
              </p>
            )}
          </div>
          <label className="w-full text-xs font-medium uppercase tracking-wide text-muted lg:w-80">
            Modeling context
            <select
              value={selectedProperty?.id ?? ""}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              disabled={properties.length <= 1}
              className="mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {getPropertyLabel(property)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {selectedProperty && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            <Link
              href={`/properties/${selectedProperty.id}`}
              className="text-muted hover:text-foreground hover:underline"
            >
              Open property detail
            </Link>
          </div>
        )}
      </div>

      {selectedProperty && (
        <div className="mt-4">
          <ProjectionsTabContent
            workspaceVariant="modeling"
            mobileHeader={mobileHeader}
            monthlyRent={selectedProperty.monthlyRent}
            monthlyExpenses={selectedProperty.monthlyExpenses}
            estimatedValue={selectedProperty.currentEstimatedValue}
            cashInvested={selectedProperty.cashInvested}
            totalMortgageBalance={selectedMortgageTotals.totalBalance}
            totalMonthlyPayment={selectedMortgageTotals.totalPayment}
            ownershipPercent={selectedProperty.ownershipPercent}
            vacancyPercent={selectedProperty.vacancyPercent}
            displayMode={displayMode}
            mortgageData={selectedProperty.mortgageData}
          />
        </div>
      )}
    </div>
  );
}
