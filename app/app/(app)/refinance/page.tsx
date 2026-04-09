import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveTier, getPropertyLimit } from "@/lib/plans";
import { getEffectiveBalance, getBalanceSource, getPayoffProjection } from "@/lib/amortization";
import { RefinanceWorkspaceLoader } from "./refinance-workspace-loader";

export default async function RefinancePage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string; mortgageId?: string }>;
}) {
  const user = await getAppUser();
  if (!user) redirect("/sign-in");
  const { propertyId, mortgageId } = await searchParams;

  const propertyLimit = getPropertyLimit(getEffectiveTier(user));
  const totalPropertyCount = await prisma.property.count({
    where: { userId: user.id },
  });
  const properties = await prisma.property.findMany({
    where: { userId: user.id, mortgages: { some: {} } },
    include: { mortgages: true },
    orderBy: { updatedAt: "desc" },
    take: propertyLimit,
  });

  const items = properties.map((p) => ({
    id: p.id,
    nickname: p.nickname,
    addressLine1: p.addressLine1,
    mortgages: p.mortgages.map((m) => {
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
          payoffDate: projection.payoffDate
            ? projection.payoffDate.toISOString().slice(0, 10)
            : null,
          remainingAtTermEnd: projection.remainingAtTermEnd,
        },
      };
    }),
  }));

  const requestedProperty = items.find((item) => item.id === propertyId);
  const defaultProperty = items[0] ?? null;
  const initialProperty = requestedProperty ?? defaultProperty;

  const initialSelectedPropertyId = initialProperty?.id;
  const initialSelectedMortgageId =
    mortgageId && initialProperty?.mortgages.some((m) => m.id === mortgageId)
      ? mortgageId
      : initialProperty?.mortgages[0]?.id;

  return (
    <RefinanceWorkspaceLoader
      properties={items}
      hasAnyProperties={totalPropertyCount > 0}
      initialSelectedPropertyId={initialSelectedPropertyId}
      initialSelectedMortgageId={initialSelectedMortgageId}
    />
  );
}
