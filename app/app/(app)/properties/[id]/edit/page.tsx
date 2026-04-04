import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getBalanceSource, getEffectiveBalance, getPayoffProjection } from "@/lib/amortization";
import { PropertyForm } from "../../property-form";
import { MortgageSection } from "../../mortgage-section";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAppUser();
  if (!user) return null;

  const { id } = await params;
  const property = await prisma.property.findFirst({
    where: { id, userId: user.id },
  });

  if (!property) notFound();

  const mortgages = await prisma.mortgage.findMany({
    where: { propertyId: id, property: { userId: user.id } },
    orderBy: { createdAt: "asc" },
  });

  const mortgageData = mortgages.map((m) => {
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

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/properties/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Back to property
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-foreground">Edit property</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Update location, purchase &amp; value, income, mortgages, and notes. Use the workspaces for
        modeling and refinance scenarios.
      </p>
      <div className="mt-6 space-y-8">
        <PropertyForm
          property={{
            id: property.id,
            nickname: property.nickname ?? undefined,
            addressLine1: property.addressLine1,
            addressLine2: property.addressLine2 ?? undefined,
            city: property.city,
            state: property.state,
            zipCode: property.zipCode,
            propertyType: property.propertyType,
            units: property.units,
            ownershipPercent: property.ownershipPercent ?? 100,
            purchasePrice: property.purchasePrice.toString(),
            purchaseDate: property.purchaseDate.toISOString().slice(0, 10),
            currentEstimatedValue: property.currentEstimatedValue.toString(),
            isRented: property.isRented,
            currentMonthlyRent: property.currentMonthlyRent.toString(),
            unitRents: Array.isArray(property.unitRents)
              ? (property.unitRents as number[]).map((n) => String(n))
              : undefined,
            currentMonthlyExpenses: property.currentMonthlyExpenses.toString(),
            vacancyPercent: property.vacancyPercent ?? 5,
            cashInvested: property.cashInvested?.toString(),
            bedrooms: property.bedrooms ?? undefined,
            bathrooms: property.bathrooms?.toString(),
            unitMix: property.unitMix ?? undefined,
            squareFeet: property.squareFeet ?? undefined,
            notes: property.notes ?? undefined,
          }}
        />
        <section
          id="section-mortgage"
          className="scroll-mt-28 rounded-xl border border-border bg-card shadow-sm"
          aria-labelledby="heading-edit-mortgage"
        >
          <div className="p-6">
            <h2 id="heading-edit-mortgage" className="text-xl font-semibold text-foreground">
              Mortgages
            </h2>
            <p className="mt-1 text-sm text-muted">
              Add, update, or remove mortgages for this property.
            </p>
          </div>
          <div className="border-t border-border p-6">
            <MortgageSection propertyId={id} mortgages={mortgageData} embedded />
          </div>
        </section>
      </div>
    </div>
  );
}
