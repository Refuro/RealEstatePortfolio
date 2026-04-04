"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatPropertyType } from "@/lib/property-utils";
import { formatCurrency } from "@/lib/format-currency";
import type { MortgageForTabs } from "./property-detail-types";

type MortgageWithBalanceSource = MortgageForTabs & {
  balanceAsOfDate?: string | null;
};

function formatDate(value: Date | string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function formatPayoffLabel(mortgage: MortgageWithBalanceSource): string {
  const effectiveBalance = mortgage.effectiveBalance ?? Number(mortgage.currentBalance);
  if (effectiveBalance <= 0) return "Paid off";

  const remaining = mortgage.payoffProjection?.remainingAtTermEnd;
  if (remaining != null && remaining > 0) {
    return `Balloon payment: ${formatCurrency(remaining)} at term end`;
  }

  const payoffDate = mortgage.payoffProjection?.payoffDate;
  if (!payoffDate) return "Not amortizing";

  return `Payoff: ${new Date(payoffDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
}

function balanceSourceLabel(mortgage: MortgageWithBalanceSource): string {
  if (mortgage.balanceSource === "stored" && mortgage.balanceAsOfDate) {
    return `Stored as of ${new Date(mortgage.balanceAsOfDate).toLocaleDateString()}`;
  }
  if (mortgage.balanceSource === "stored_projected" && mortgage.balanceAsOfDate) {
    return `Stepped forward from ${new Date(mortgage.balanceAsOfDate).toLocaleDateString()}`;
  }
  return "From amortization";
}

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
    isRented: boolean;
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
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Property facts</h2>
          <Link
            href={`/properties/${propertyId}/edit#section-location`}
            className="inline-flex min-h-[44px] items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
          >
            Edit
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </div>
        <div className="p-6">
          <dl className="space-y-3">
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
              <dd className="text-sm font-medium text-foreground">{formatDate(property.purchaseDate)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Financial inputs</h2>
          <Link
            href={`/properties/${propertyId}/edit#section-economics`}
            className="inline-flex min-h-[44px] items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
          >
            Edit
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </div>
        <div className="p-6">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted">Purchase price</dt>
              <dd className="tabular-nums text-sm font-medium text-foreground">
                {formatCurrency(Number(property.purchasePrice))}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Current estimated value</dt>
              <dd className="tabular-nums text-sm font-medium text-foreground">
                {formatCurrency(Number(property.currentEstimatedValue))}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-muted">Monthly rent</dt>
              <dd className="tabular-nums text-sm font-medium text-foreground">
                {Array.isArray(property.unitRents) && property.unitRents.length > 1 ? (
                  <>
                    {property.unitRents.map((rent, idx) => (
                      <span key={idx}>
                        {idx > 0 && ", "}Unit {idx + 1}: {formatCurrency(Number(rent))}
                      </span>
                    ))}{" "}
                    <span className="text-muted">(Total: {formatCurrency(totalRent)})</span>
                  </>
                ) : Array.isArray(property.unitRents) && property.unitRents.length === 1 ? (
                  formatCurrency(Number(property.unitRents[0]))
                ) : (
                  formatCurrency(totalRent)
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Rental status</dt>
              <dd className="text-sm font-medium text-foreground">
                {property.isRented ? "Currently rented" : "Not currently rented"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Monthly expenses</dt>
              <dd className="tabular-nums text-sm font-medium text-foreground">
                {formatCurrency(Number(property.currentMonthlyExpenses))}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Ownership</dt>
              <dd className="tabular-nums text-sm font-medium text-foreground">
                {property.ownershipPercent != null ? `${property.ownershipPercent}%` : "100%"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Vacancy</dt>
              <dd className="tabular-nums text-sm font-medium text-foreground">
                {property.vacancyPercent != null ? `${property.vacancyPercent}%` : "5%"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted">Cash invested</dt>
              <dd className="tabular-nums text-sm font-medium text-foreground">
                {property.cashInvested != null ? formatCurrency(Number(property.cashInvested)) : "—"}
              </dd>
            </div>
          </dl>
          <div className="mt-3">
            <Link
              href={`/properties/${propertyId}/edit#section-income`}
              className="inline-flex min-h-[44px] items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
            >
              Edit income inputs
              <ChevronRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section id="mortgages" className="scroll-mt-20 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Mortgage terms</h2>
          <Link
            href={`/properties/${propertyId}/edit#section-mortgage`}
            className="inline-flex min-h-[44px] items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
          >
            Edit
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </div>
        <div className="p-6">
          {mortgageData.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted">No mortgage on file.</p>
              <Link
                href={`/properties/${propertyId}/edit#section-mortgage`}
                className="inline-flex min-h-[44px] items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
              >
                Add mortgage
                <ChevronRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {mortgageData.map((mortgage) => (
                <div key={mortgage.id} className="rounded-md bg-subtle/40 p-4">
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-muted">
                        {mortgage.balanceSource === "stored" ? "Balance" : "Est. balance"}
                      </dt>
                      <dd className="tabular-nums text-sm font-medium text-foreground">
                        {formatCurrency(mortgage.effectiveBalance ?? Number(mortgage.currentBalance))}
                      </dd>
                      <p className="mt-0.5 text-xs text-muted">{balanceSourceLabel(mortgage)}</p>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted">Rate</dt>
                      <dd className="tabular-nums text-sm font-medium text-foreground">
                        {(Number(mortgage.interestRate) * 100).toFixed(2)}%
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted">Term</dt>
                      <dd className="tabular-nums text-sm font-medium text-foreground">
                        {mortgage.termYears} years
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted">Monthly payment</dt>
                      <dd className="tabular-nums text-sm font-medium text-foreground">
                        {formatCurrency(Number(mortgage.monthlyPayment))}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted">Payoff projection</dt>
                      <dd className="text-sm font-medium text-foreground">{formatPayoffLabel(mortgage)}</dd>
                    </div>
                  </dl>
                </div>
              ))}

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/refinance?propertyId=${encodeURIComponent(propertyId)}`}
                  className="inline-flex min-h-[44px] items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
                >
                  Open Refinance workspace
                  <ChevronRight className="size-3.5" aria-hidden />
                </Link>
                <Link
                  href={`/properties/${propertyId}/edit#section-mortgage`}
                  className="inline-flex min-h-[44px] items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
                >
                  Add another mortgage
                  <ChevronRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Notes</h2>
          <Link
            href={`/properties/${propertyId}/edit#section-notes`}
            className="inline-flex min-h-[44px] items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
          >
            Edit
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </div>
        <div className="p-6">
          <p className="whitespace-pre-wrap text-sm text-muted">
            {property.notes?.trim() ? property.notes : "No notes added."}
          </p>
        </div>
      </section>
    </div>
  );
}
