import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPropertyTotalRent } from "@/lib/property-utils";
import { getEffectiveBalance, getBalanceSource, getPayoffProjection } from "@/lib/amortization";
import { computePropertyMetrics, getAnnualDebtService } from "@/lib/metrics/property-metrics";
import { PropertyActions } from "../property-actions";
import { PropertyDetailTabs } from "./property-detail-tabs";

export default async function PropertyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; tab?: string }>;
}) {
  const user = await getAppUser();
  if (!user) return null;

  const { id } = await params;
  const { from } = await searchParams;
  const fromQuickAdd = from === "quick-add";
  const property = await prisma.property.findFirst({
    where: { id, userId: user.id },
    include: { mortgages: true },
  });

  if (!property) notFound();

  type MortgageItem = (typeof property.mortgages)[number];
  const totalMortgageBalance = property.mortgages.reduce(
    (sum: number, m) => sum + getEffectiveBalance(m),
    0
  );
  const totalMonthlyPayment = property.mortgages.reduce(
    (sum: number, m: { monthlyPayment: unknown }) => sum + Number(m.monthlyPayment),
    0
  );
  const ownershipPercent = property.ownershipPercent ?? 100;
  const totalRent = getPropertyTotalRent(property);
  const displayMode = (user.ownershipDisplayMode ?? "proportional") as "proportional" | "full_liability";
  const metrics = computePropertyMetrics(
    {
      monthlyRent: totalRent,
      monthlyExpenses: Number(property.currentMonthlyExpenses),
      estimatedValue: Number(property.currentEstimatedValue),
      cashInvested: property.cashInvested != null ? Number(property.cashInvested) : null,
      totalMortgageBalance,
      totalMonthlyPayment,
      ownershipPercent,
      vacancyPercent: property.vacancyPercent ?? 5,
    },
    displayMode
  );

  const address = [property.addressLine1, property.addressLine2, property.city, property.state, property.zipCode]
    .filter(Boolean)
    .join(", ");

  const pageTitle = property.nickname?.trim() || address || "Property";

  const mortgageData = property.mortgages.map((m: MortgageItem) => {
    const projection = getPayoffProjection(m);
    return {
      id: m.id,
      originalLoanAmount: m.originalLoanAmount.toString(),
      currentBalance: m.currentBalance.toString(),
      balanceAsOfDate: m.balanceAsOfDate?.toISOString().slice(0, 10) ?? null,
      interestRate: m.interestRate.toString(),
      termYears: m.termYears,
      startDate: m.startDate.toISOString().slice(0, 10),
      monthlyPayment: m.monthlyPayment.toString(),
      paymentEffectiveDate: m.paymentEffectiveDate?.toISOString().slice(0, 10) ?? null,
      escrowIncluded: m.escrowIncluded,
      escrowAmount: m.escrowAmount != null ? m.escrowAmount.toString() : null,
      lenderName: m.lenderName,
      loanType: m.loanType,
      effectiveBalance: getEffectiveBalance(m),
      balanceSource: getBalanceSource(m),
      payoffProjection: {
        payoffDate: projection.payoffDate ? projection.payoffDate.toISOString().slice(0, 10) : null,
        remainingAtTermEnd: projection.remainingAtTermEnd,
      },
    };
  });

  const annualDebtService = getAnnualDebtService(totalMonthlyPayment, ownershipPercent, displayMode);
  const dscr = annualDebtService > 0 ? metrics.noi / annualDebtService : null;

  const unitRents = Array.isArray(property.unitRents)
    ? (property.unitRents as number[]).map((r) => (typeof r === "number" ? r : Number(r)))
    : null;

  const propertyForTabs = {
    nickname: property.nickname,
    addressLine1: property.addressLine1,
    addressLine2: property.addressLine2,
    city: property.city,
    state: property.state,
    zipCode: property.zipCode,
    propertyType: property.propertyType,
    units: property.units,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms != null ? Number(property.bathrooms) : null,
    squareFeet: property.squareFeet,
    purchasePrice: Number(property.purchasePrice),
    purchaseDate: property.purchaseDate,
    currentEstimatedValue: Number(property.currentEstimatedValue),
    currentMonthlyExpenses: Number(property.currentMonthlyExpenses),
    isRented: property.isRented,
    unitRents,
    ownershipPercent: property.ownershipPercent,
    vacancyPercent: property.vacancyPercent,
    cashInvested: property.cashInvested != null ? Number(property.cashInvested) : null,
    notes: property.notes,
    marketRent: property.marketRent != null ? Number(property.marketRent) : null,
    marketRentAsOf: property.marketRentAsOf,
    hasMortgage: property.hasMortgage ?? null,
    updatedAt: property.updatedAt,
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/properties"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Properties
        </Link>
        <PropertyActions propertyId={property.id} />
      </div>

      <h1 className="text-2xl font-semibold text-foreground">{pageTitle}</h1>

      {fromQuickAdd && (
        <div className="mt-3 rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold text-foreground">
            Property created with quick-add
          </p>
          <p className="mt-1 text-sm text-muted">
            Add purchase details, mortgage info, and property specs to unlock DSCR, LTV,
            cash-on-cash return, and payoff projections.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/properties/${property.id}/edit`}
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
            >
              Complete details
            </Link>
            <Link
              href={`/properties/${property.id}`}
              className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
            >
              I&apos;ll do this later
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}>
        <PropertyDetailTabs
          propertyId={property.id}
          property={propertyForTabs}
          address={address}
          totalRent={totalRent}
          mortgageData={mortgageData}
          metrics={{
            equity: metrics.equity,
            monthlyCashFlow: metrics.monthlyCashFlow,
            noi: metrics.noi,
            capRate: metrics.capRate,
            ltv: metrics.ltv,
            cashOnCashReturn: metrics.cashOnCashReturn,
            grossAnnualRent: metrics.grossAnnualRent,
          }}
          dscr={dscr}
          totalMortgageBalance={totalMortgageBalance}
          totalMonthlyPayment={totalMonthlyPayment}
          ownershipPercent={ownershipPercent}
          vacancyPercent={property.vacancyPercent ?? 5}
          displayMode={displayMode}
        />
      </Suspense>
      </div>
    </div>
  );
}
