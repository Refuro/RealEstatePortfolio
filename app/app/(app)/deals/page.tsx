import Link from "next/link";
import { getAppUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDealLimit, getEffectiveTier } from "@/lib/plans";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import { DealsList } from "./deals-list";
import { PlusCircle } from "lucide-react";

export default async function DealsPage() {
  const user = await getAppUser();
  if (!user) redirect("/sign-in");

  const dealLimit = getDealLimit(getEffectiveTier(user));
  const [totalCount, deals] = await Promise.all([
    prisma.savedDeal.count({ where: { userId: user.id } }),
    prisma.savedDeal.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: dealLimit,
    }),
  ]);
  const overLimit = totalCount > dealLimit;
  const atLimit = totalCount >= dealLimit;

  const dealsWithMetrics = deals.map((d) => {
    const value = d.currentEstimatedValue
      ? Number(d.currentEstimatedValue)
      : d.purchasePrice
        ? Number(d.purchasePrice)
        : 0;
    const metrics = computePropertyMetrics(
      {
        monthlyRent: Number(d.currentMonthlyRent),
        monthlyExpenses: Number(d.currentMonthlyExpenses),
        estimatedValue: value,
        cashInvested: d.cashInvested ? Number(d.cashInvested) : null,
        totalMortgageBalance: Number(d.totalMortgageBalance),
        totalMonthlyPayment: Number(d.totalMonthlyPayment),
        ownershipPercent: d.ownershipPercent ?? 100,
        vacancyPercent: d.vacancyPercent ?? 5,
      },
      "proportional"
    );
    return {
      id: d.id,
      nickname: d.nickname,
      addressLine1: d.addressLine1,
      addressLine2: d.addressLine2,
      city: d.city,
      state: d.state,
      zipCode: d.zipCode,
      createdAt: d.createdAt.toISOString(),
      metrics: {
        monthlyCashFlow: metrics.monthlyCashFlow,
        capRate: metrics.capRate,
        equity: metrics.equity,
        cashOnCashReturn: metrics.cashOnCashReturn,
      },
    };
  });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Saved deals</h1>
          <p className="mt-1 text-base text-muted">
            Deals you&apos;ve analyzed and saved for comparison. Metrics use the same proportional math as elsewhere (they do not follow portfolio &quot;full liability&quot; display mode).
          </p>
          <p className="mt-1 text-sm text-muted">
            {deals.length} of {dealLimit} saved deals
            {atLimit && (
              <>
                {" · "}
                <Link href="/plans" className="font-medium text-foreground hover:underline">
                  Upgrade to save more
                </Link>
              </>
            )}
          </p>
        </div>
        <Link
          href="/analyze"
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
        >
          <PlusCircle size={15} />
          Analyze a deal
        </Link>
      </div>

      {overLimit && (
        <p className="mt-1 text-sm text-muted">
          Showing {deals.length} of {totalCount} saved deals (plan limit).{" "}
          <Link href="/plans" className="font-medium text-foreground hover:underline">
            Upgrade to see all
          </Link>
        </p>
      )}

      {dealsWithMetrics.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border/70 bg-card/95 p-8 text-center shadow-sm">
          <h2 className="text-lg font-medium text-foreground">
            No saved deals yet
          </h2>
          <p className="mt-2 text-base text-muted">
            Analyze a deal and save it to compare later.
          </p>
          <Link
            href="/analyze"
            className="mt-4 inline-block rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Analyze a deal
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <DealsList deals={dealsWithMetrics} />
        </div>
      )}
    </div>
  );
}
