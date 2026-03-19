"use client";

import Link from "next/link";
import { formatPropertyType } from "@/lib/property-utils";
import { formatCurrency } from "@/lib/format-currency";
import { MortgageSection } from "../mortgage-section";
import { PropertyHealthStrip } from "./property-health-strip";
import type { MortgageForTabs } from "./property-detail-types";

type MortgageWithBalanceSource = MortgageForTabs & {
  balanceAsOfDate?: string | null;
};

export function DetailsTabContent({
  propertyId,
  property,
  address,
  totalRent,
  mortgageData,
}: {
  propertyId: string;
  property: {
    nickname: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    zipCode: string;
    propertyType: string;
    units: number;
    bedrooms: number | null;
    bathrooms: number | null;
    unitMix: string | null;
    squareFeet: number | null;
    purchasePrice: number;
    purchaseDate: Date | string;
    currentEstimatedValue: number;
    currentMonthlyExpenses: number;
    unitRents: number[] | null;
    ownershipPercent: number | null;
    vacancyPercent: number | null;
    cashInvested: number | null;
    notes: string | null;
    marketRent: number | null;
    marketRentAsOf: Date | string | null;
    updatedAt: Date | string;
  };
  address: string;
  totalRent: number;
  mortgageData: MortgageWithBalanceSource[];
}) {
  const mortgageDataForSection = mortgageData.map((m) => ({
    ...m,
    balanceAsOfDate: m.balanceAsOfDate ?? null,
    paymentEffectiveDate: m.paymentEffectiveDate ?? null,
    escrowIncluded: m.escrowIncluded ?? false,
  }));

  const detailsSummary = [
    property.bedrooms != null && `${property.bedrooms} bed`,
    property.bathrooms != null && `${Number(property.bathrooms)} bath`,
    property.unitMix && property.unitMix,
    property.squareFeet != null && `${property.squareFeet.toLocaleString()} sq ft`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Data & settings
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Summary of what&apos;s on file. To change address, type, rent, expenses, notes, and more,
            use the full editor—same fields as when you add a property.
          </p>
        </div>
        <Link
          href={`/properties/${propertyId}/edit`}
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
        >
          Edit property
        </Link>
      </div>

      <PropertyHealthStrip
        property={{
          updatedAt: property.updatedAt,
          marketRent: property.marketRent,
          marketRentAsOf: property.marketRentAsOf,
        }}
        mortgageData={mortgageDataForSection}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Property facts</h3>
          <dl className="mt-3 space-y-3">
            {property.nickname && (
              <div>
                <dt className="text-sm font-medium text-muted">Nickname</dt>
                <dd className="text-sm font-medium text-foreground">{property.nickname}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-muted">Address</dt>
              <dd className="text-sm font-medium text-foreground">{address || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Property type</dt>
              <dd className="text-sm font-medium text-foreground">
                {formatPropertyType(property.propertyType, property.units)}
              </dd>
            </div>
            {detailsSummary && (
              <div>
                <dt className="text-sm font-medium text-muted">Details</dt>
                <dd className="text-sm font-medium text-foreground">{detailsSummary}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-muted">Purchase date</dt>
              <dd className="text-sm font-medium text-foreground">
                {new Date(property.purchaseDate).toISOString().slice(0, 10)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Financial inputs</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted">Purchase price</dt>
              <dd className="text-sm font-medium text-foreground">{formatCurrency(Number(property.purchasePrice))}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Current estimated value</dt>
              <dd className="text-sm font-medium text-foreground">{formatCurrency(Number(property.currentEstimatedValue))}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-muted">Monthly rent</dt>
              <dd className="text-sm font-medium text-foreground">
                {Array.isArray(property.unitRents) && (property.unitRents as number[]).length > 1 ? (
                  <>
                    {(property.unitRents as number[]).map((r, i) => (
                      <span key={i}>
                        {i > 0 && ", "}Unit {i + 1}: {formatCurrency(Number(r))}
                      </span>
                    ))}{" "}
                    <span className="text-muted">(Total: {formatCurrency(totalRent)})</span>
                  </>
                ) : Array.isArray(property.unitRents) && (property.unitRents as number[]).length === 1 ? (
                  formatCurrency(Number((property.unitRents as number[])[0]))
                ) : (
                  formatCurrency(totalRent)
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Monthly expenses</dt>
              <dd className="text-sm font-medium text-foreground">
                {formatCurrency(Number(property.currentMonthlyExpenses))}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Ownership</dt>
              <dd className="text-sm font-medium text-foreground">
                {property.ownershipPercent != null ? `${property.ownershipPercent}%` : "100%"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Vacancy</dt>
              <dd className="text-sm font-medium text-foreground">
                {property.vacancyPercent != null ? `${property.vacancyPercent}%` : "5%"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Cash invested</dt>
              <dd className="text-sm font-medium text-foreground">
                {property.cashInvested != null ? formatCurrency(Number(property.cashInvested)) : "—"}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Notes</h3>
        <p className="mt-2 text-sm text-muted whitespace-pre-wrap">{property.notes || "—"}</p>
      </section>

      <section id="mortgages" className="scroll-mt-20 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Mortgage terms</h3>
          <Link
            href={`/mortgage?propertyId=${encodeURIComponent(propertyId)}`}
            className="text-sm font-medium text-accent hover:underline"
          >
            Open Mortgage workspace
          </Link>
        </div>
        <div className="mt-4">
          <MortgageSection
            propertyId={propertyId}
            mortgages={mortgageDataForSection}
            embedded
          />
        </div>
      </section>
    </div>
  );
}
