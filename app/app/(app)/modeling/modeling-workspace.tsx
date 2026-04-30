"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { MobileContextBar } from "@/components/mobile-context-bar";
import type { MortgageForTabs } from "../properties/[id]/property-detail-types";

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
}: {
  properties: ModelingProperty[];
  initialSelectedPropertyId?: string;
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

  const mobileContextBar = selectedProperty ? (
    <MobileContextBar
      title="Modeling"
      subtitle={
        <select
          value={selectedProperty.id}
          onChange={(e) => setSelectedPropertyId(e.target.value)}
          disabled={properties.length <= 1}
          className="max-w-[12rem] appearance-none bg-transparent pr-4 text-sm font-medium text-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        >
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {getPropertyLabel(property)}
            </option>
          ))}
        </select>
      }
    />
  ) : null;

  if (properties.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Modeling</h1>
        <p className="mt-2 text-base text-muted">
          Run portfolio-style what-if scenarios from one place.
        </p>
        <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
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
      <div className="hidden md:block">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-2xl font-semibold text-foreground">Modeling</h1>
            <p className="text-sm text-muted">
              Run scenario assumptions in a global workspace.
            </p>
            {selectedProperty && (
              <Link
                href={`/properties/${selectedProperty.id}`}
                className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
              >
                <ChevronRight className="size-3.5" aria-hidden />
                Open property detail
              </Link>
            )}
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-muted">
            <span>Property</span>
            <select
              value={selectedProperty?.id ?? ""}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              disabled={properties.length <= 1}
              className="block w-64 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {getPropertyLabel(property)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {selectedProperty && (
        <div className="mt-4">
          <ProjectionsTabContent
            workspaceVariant="modeling"
            contextBar={mobileContextBar}
            monthlyRent={selectedProperty.monthlyRent}
            monthlyExpenses={selectedProperty.monthlyExpenses}
            estimatedValue={selectedProperty.currentEstimatedValue}
            cashInvested={selectedProperty.cashInvested}
            totalMortgageBalance={selectedMortgageTotals.totalBalance}
            totalMonthlyPayment={selectedMortgageTotals.totalPayment}
            ownershipPercent={selectedProperty.ownershipPercent}
            vacancyPercent={selectedProperty.vacancyPercent}
            mortgageData={selectedProperty.mortgageData}
          />
        </div>
      )}
    </div>
  );
}
