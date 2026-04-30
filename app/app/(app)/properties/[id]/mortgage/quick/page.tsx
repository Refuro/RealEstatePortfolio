import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { QuickMortgageForm } from "../../../quick-mortgage-form";

export default async function QuickMortgagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAppUser();
  if (!user) return null;

  const { id } = await params;
  const property = await prisma.property.findFirst({
    where: { id, userId: user.id },
    include: { mortgages: { select: { id: true }, take: 1 } },
  });

  if (!property) notFound();

  if (property.mortgages.length > 0) {
    redirect(`/properties/${id}`);
  }

  const propertyCount = await prisma.property.count({ where: { userId: user.id } });
  const isOnlyProperty = propertyCount === 1;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/properties/${id}`}
          className="inline-flex min-h-[44px] items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Back to property
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-foreground">Add mortgage info</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Just the basics needed for accurate cash flow and payoff projections. You can edit this
        anytime.
      </p>

      <div className="mt-6">
        <QuickMortgageForm propertyId={id} isOnlyProperty={isOnlyProperty} />
      </div>
    </div>
  );
}
