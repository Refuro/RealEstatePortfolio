import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import { PropertyActions } from "../property-actions";
import { MortgageSection } from "../mortgage-section";
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

  const totalMortgageBalance = property.mortgages.reduce((sum, m) => sum + Number(m.currentBalance), 0);
  const totalMonthlyPayment = property.mortgages.reduce((sum, m) => sum + Number(m.monthlyPayment), 0);
  const metrics = computePropertyMetrics({
    monthlyRent: Number(property.currentMonthlyRent),
    monthlyExpenses: Number(property.currentMonthlyExpenses),
    estimatedValue: Number(property.currentEstimatedValue),
    cashInvested: property.cashInvested != null ? Number(property.cashInvested) : null,
    totalMortgageBalance,
    totalMonthlyPayment,
  });

  const address = [property.addressLine1, property.addressLine2, property.city, property.state, property.zipCode]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/properties"
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← Properties
        </Link>
        <PropertyActions propertyId={property.id} />
      </div>

      <h1 className="text-2xl font-semibold text-zinc-900">
        {property.nickname || property.addressLine1}
      </h1>
      <p className="mt-1 text-zinc-600">{address}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Property details
          </h2>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-sm text-zinc-500">Purchase price</dt>
              <dd className="font-medium text-zinc-900">
                ${Number(property.purchasePrice).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-500">Purchase date</dt>
              <dd className="font-medium text-zinc-900">
                {property.purchaseDate.toISOString().slice(0, 10)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-500">Current estimated value</dt>
              <dd className="font-medium text-zinc-900">
                ${Number(property.currentEstimatedValue).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-500">Monthly rent</dt>
              <dd className="font-medium text-zinc-900">
                ${Number(property.currentMonthlyRent).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-500">Monthly expenses</dt>
              <dd className="font-medium text-zinc-900">
                ${Number(property.currentMonthlyExpenses).toLocaleString()}
              </dd>
            </div>
            {property.cashInvested != null && (
              <div>
                <dt className="text-sm text-zinc-500">Cash invested</dt>
                <dd className="font-medium text-zinc-900">
                  ${Number(property.cashInvested).toLocaleString()}
                </dd>
              </div>
            )}
            {property.notes && (
              <div>
                <dt className="text-sm text-zinc-500">Notes</dt>
                <dd className="text-zinc-700">{property.notes}</dd>
              </div>
            )}
          </dl>
          <Link
            href={`/properties/${property.id}/edit`}
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline hover:no-underline"
          >
            Edit property
          </Link>
        </section>

        <MortgageSection
          propertyId={property.id}
          mortgages={property.mortgages.map((m) => ({
            id: m.id,
            originalLoanAmount: m.originalLoanAmount.toString(),
            currentBalance: m.currentBalance.toString(),
            interestRate: m.interestRate.toString(),
            termYears: m.termYears,
            startDate: m.startDate.toISOString().slice(0, 10),
            monthlyPayment: m.monthlyPayment.toString(),
            escrowIncluded: m.escrowIncluded,
            lenderName: m.lenderName,
            loanType: m.loanType,
          }))}
        />
      </div>

      <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Investment metrics
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <dt className="text-sm text-zinc-500">Monthly cash flow</dt>
            <dd className={`font-medium ${metrics.monthlyCashFlow >= 0 ? "text-emerald-700" : "text-red-700"}`}>
              {formatCurrency(metrics.monthlyCashFlow)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Annual cash flow</dt>
            <dd className={`font-medium ${metrics.annualCashFlow >= 0 ? "text-emerald-700" : "text-red-700"}`}>
              {formatCurrency(metrics.annualCashFlow)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-500">Equity</dt>
            <dd className="font-medium text-zinc-900">{formatCurrency(metrics.equity)}</dd>
          </div>
          {metrics.capRate != null && (
            <div>
              <dt className="text-sm text-zinc-500">Cap rate</dt>
              <dd className="font-medium text-zinc-900">{(metrics.capRate * 100).toFixed(2)}%</dd>
            </div>
          )}
          {metrics.ltv != null && (
            <div>
              <dt className="text-sm text-zinc-500">Loan-to-value</dt>
              <dd className="font-medium text-zinc-900">{(metrics.ltv * 100).toFixed(1)}%</dd>
            </div>
          )}
          {metrics.cashOnCashReturn != null && (
            <div>
              <dt className="text-sm text-zinc-500">Cash-on-cash return</dt>
              <dd className="font-medium text-zinc-900">{(metrics.cashOnCashReturn * 100).toFixed(2)}%</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="mt-8">
        <AmortizationChart propertyId={property.id} />
      </section>
    </div>
  );
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}
