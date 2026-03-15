import { getAppUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDealLimit } from "@/lib/plans";
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
  const dealLimit = getDealLimit(user.subscriptionTier);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Analyze deal</h1>
      <p className="mt-2 text-base text-muted">
        Enter property details to see investment metrics. Save deals to compare later.
      </p>
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
