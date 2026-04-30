import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveTier, getPropertyLimit } from "@/lib/plans";
import { getEffectiveBalance } from "@/lib/amortization";
import { ModelingWorkspace } from "./modeling-workspace";

export default async function ModelingPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string }>;
}) {
  const user = await getAppUser();
  if (!user) redirect("/sign-in");
  const { propertyId } = await searchParams;

  const propertyLimit = getPropertyLimit(getEffectiveTier(user));
  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    include: { mortgages: true },
    orderBy: { updatedAt: "desc" },
    take: propertyLimit,
  });

  const items = properties.map((p) => ({
    id: p.id,
    nickname: p.nickname,
    addressLine1: p.addressLine1,
    propertyType: p.propertyType,
    units: p.units,
    monthlyRent: Number(p.currentMonthlyRent),
    monthlyExpenses: Number(p.currentMonthlyExpenses),
    currentEstimatedValue: Number(p.currentEstimatedValue),
    cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
    ownershipPercent: p.ownershipPercent ?? 100,
    vacancyPercent: p.vacancyPercent ?? 5,
    mortgageCount: p.mortgages.length,
    mortgageData: p.mortgages.map((m) => ({
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
      balanceSource: "stored" as const,
    })),
  }));

  const initialSelectedPropertyId = items.some((item) => item.id === propertyId) ? propertyId : undefined;

  return (
    <ModelingWorkspace
      properties={items}
      initialSelectedPropertyId={initialSelectedPropertyId}
    />
  );
}
