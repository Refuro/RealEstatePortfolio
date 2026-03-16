import Link from "next/link";
import { getAppUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDealLimit } from "@/lib/plans";
import { takeFirstNByUpdatedAt } from "@/lib/limit-utils";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import { DealsList } from "./deals-list";

export default async function DealsPage() {
  const user = await getAppUser();
  if (!user) redirect("/sign-in");

  const allDeals = await prisma.savedDeal.findMany({
    where: { userId: user.id },
  });

  const dealLimit = getDealLimit(user.subscriptionTier);
  const deals = takeFirstNByUpdatedAt(allDeals, dealLimit);
  const totalCount = allDeals.length;
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
      },
    };
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Saved deals</h1>
      <p className="mt-1 text-base text-muted">
        Deals you&apos;ve analyzed and saved for comparison.
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

      {overLimit && (
        <p className="mt-1 text-sm text-muted">
          Showing {deals.length} of {totalCount} saved deals (plan limit).{" "}
          <Link href="/plans" className="font-medium text-foreground hover:underline">
            Upgrade to see all
          </Link>
        </p>
      )}

      {dealsWithMetrics.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-card p-8 text-center">
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
