import Link from "next/link";
import { getAppUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDealLimit, getEffectiveTier } from "@/lib/plans";
import { DealAnalyzerForm } from "./deal-analyzer-form";

export const dynamic = "force-dynamic";

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ deal?: string }>;
}) {
  const user = await getAppUser();
  if (!user) redirect("/sign-in");

  const { deal: dealId } = await searchParams;

  const dealCount = await prisma.savedDeal.count({
    where: { userId: user.id },
  });
  const dealLimit = getDealLimit(getEffectiveTier(user));

  return (
    <div>
      <div className="rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Analyze deal</h1>
          <p className="mt-1 text-sm text-muted">
            Enter deal assumptions, review investment outcomes, and save for comparison.
          </p>
          <p className="mt-3 text-sm text-muted">
            <Link href="/deals" className="font-medium text-accent hover:underline">
              View saved deals
            </Link>{" "}
            to compare or edit analyses you&apos;ve already stored.
          </p>
        </div>
      </div>
      <div className="mt-8">
        <DealAnalyzerForm
          key={dealId ?? "new"}
          dealId={dealId}
          dealCount={dealCount}
          dealLimit={dealLimit}
        />
      </div>
    </div>
  );
}
