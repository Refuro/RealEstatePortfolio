import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPropertyTotalRent, formatPropertyType } from "@/lib/property-utils";
import { formatTimeAgo, isDataStale } from "@/lib/date-utils";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import { PropertyActions } from "../property-actions";
import { MortgageSection } from "../mortgage-section";
import { PropertyMetricsSection } from "../property-metrics-section";
import { ScenarioSection } from "./scenario-section";
import { AmortizationChart } from "@/components/charts/amortization-chart";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAppUser();
  if (!user) return null;

  const { id } = await params;
  const property = await prisma.property.findFirst({
    where: { id, userId: user.id },
    include: { mortgages: true },
  });

  if (!property) notFound();

  type MortgageItem = (typeof property.mortgages)[number];
  const totalMortgageBalance = property.mortgages.reduce(
    (sum: number, m: { currentBalance: unknown }) => sum + Number(m.currentBalance),
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/properties"
          className="text-base text-muted hover:text-foreground"
        >
          ← Properties
        </Link>
        <PropertyActions propertyId={property.id} />
      </div>

      <h1 className="text-2xl font-semibold text-foreground">
        {property.nickname || property.addressLine1}
      </h1>
      <p className="mt-1 text-sm text-muted">{address}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Property details
            </h2>
            <p className="text-xs text-muted">
              Last updated {formatTimeAgo(property.updatedAt)}
              {isDataStale(property.updatedAt instanceof Date ? property.updatedAt : new Date(property.updatedAt)) && (
                <span className="ml-1">· Consider updating</span>
              )}
            </p>
          </div>
          <dl className="space-y-3">
            <div>
              <dt className="text-base font-medium text-muted">Property type</dt>
              <dd className="text-base font-medium text-foreground">
                {formatPropertyType(property.propertyType, property.units)}
              </dd>
            </div>
            <div>
              <dt className="text-base font-medium text-muted">Purchase price</dt>
              <dd className="text-lg font-medium text-foreground">
                ${Number(property.purchasePrice).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-base font-medium text-muted">Purchase date</dt>
              <dd className="text-base font-medium text-foreground">
                {property.purchaseDate.toISOString().slice(0, 10)}
              </dd>
            </div>
            <div>
              <dt className="text-base font-medium text-muted">Current estimated value</dt>
              <dd className="text-lg font-medium text-foreground">
                ${Number(property.currentEstimatedValue).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-base font-medium text-muted">Monthly rent</dt>
              <dd className="text-lg font-medium text-foreground">
                {Array.isArray(property.unitRents) && (property.unitRents as number[]).length > 0 ? (
                  <>
                    {(property.unitRents as number[]).map((r, i) => (
                      <span key={i}>
                        {i > 0 && ", "}Unit {i + 1}: ${Number(r).toLocaleString()}
                      </span>
                    ))}
                    {" "}
                    <span className="text-muted">(Total: ${totalRent.toLocaleString()})</span>
                  </>
                ) : (
                  `$${totalRent.toLocaleString()}`
                )}
              </dd>
            </div>
            {(property.bedrooms != null || property.bathrooms != null || property.unitMix) && (
              <div>
                <dt className="text-base font-medium text-muted">Details</dt>
                <dd className="text-base font-medium text-foreground">
                  {[
                    property.bedrooms != null && `${property.bedrooms} bed`,
                    property.bathrooms != null && `${Number(property.bathrooms)} bath`,
                    property.unitMix && property.unitMix,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-base font-medium text-muted">Monthly expenses</dt>
              <dd className="text-lg font-medium text-foreground">
                ${Number(property.currentMonthlyExpenses).toLocaleString()}
              </dd>
            </div>
            {property.ownershipPercent != null && property.ownershipPercent < 100 && (
              <div>
                <dt className="text-base font-medium text-muted">Ownership</dt>
                <dd className="text-base font-medium text-foreground">
                  {property.ownershipPercent}%
                </dd>
              </div>
            )}
            {property.vacancyPercent != null && property.vacancyPercent !== 5 && (
              <div>
                <dt className="text-base font-medium text-muted">Vacancy</dt>
                <dd className="text-base font-medium text-foreground">
                  {property.vacancyPercent}%
                </dd>
              </div>
            )}
            {property.cashInvested != null && (
              <div>
                <dt className="text-base font-medium text-muted">Cash invested</dt>
                <dd className="text-lg font-medium text-foreground">
                  ${Number(property.cashInvested).toLocaleString()}
                </dd>
              </div>
            )}
            {property.notes && (
              <div>
                <dt className="text-base font-medium text-muted">Notes</dt>
                <dd className="text-base text-muted">{property.notes}</dd>
              </div>
            )}
          </dl>
          <Link
            href={`/properties/${property.id}/edit`}
            className="mt-4 inline-block text-base font-medium text-foreground hover:no-underline"
          >
            Edit property
          </Link>
        </section>

        <MortgageSection
          propertyId={property.id}
          mortgages={property.mortgages.map((m: MortgageItem) => ({
            id: m.id,
            originalLoanAmount: m.originalLoanAmount.toString(),
            currentBalance: m.currentBalance.toString(),
            interestRate: m.interestRate.toString(),
            termYears: m.termYears,
            startDate: m.startDate.toISOString().slice(0, 10),
            monthlyPayment: m.monthlyPayment.toString(),
            paymentEffectiveDate: m.paymentEffectiveDate?.toISOString().slice(0, 10) ?? null,
            escrowIncluded: m.escrowIncluded,
            lenderName: m.lenderName,
            loanType: m.loanType,
          }))}
        />
      </div>

      <PropertyMetricsSection metrics={metrics} />

      <ScenarioSection
        monthlyRent={totalRent}
        monthlyExpenses={Number(property.currentMonthlyExpenses)}
        estimatedValue={Number(property.currentEstimatedValue)}
        cashInvested={property.cashInvested != null ? Number(property.cashInvested) : null}
        totalMortgageBalance={totalMortgageBalance}
        totalMonthlyPayment={totalMonthlyPayment}
        ownershipPercent={ownershipPercent}
        vacancyPercent={property.vacancyPercent ?? 5}
        displayMode={displayMode}
      />

      <section className="mt-10 rounded-lg border border-border bg-card p-6">
        <p className="mb-4 text-sm text-muted">
          Original mortgage schedule. Not affected by scenario changes above.
        </p>
        <AmortizationChart propertyId={property.id} />
      </section>
    </div>
  );
}
