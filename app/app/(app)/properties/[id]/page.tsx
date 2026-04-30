import { notFound } from "next/navigation";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPropertyTotalRent } from "@/lib/property-utils";
import { getEffectiveBalance, getBalanceSource, getPayoffProjection } from "@/lib/amortization";
import { computePropertyMetrics, getAnnualDebtService } from "@/lib/metrics/property-metrics";
import { getPropertyCompleteness } from "@/lib/property-completeness";
import { getPropertyStatus } from "@/lib/property-status";
import { PropertyDetailContent } from "./property-detail-content";

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
    (sum: number, m) => sum + getEffectiveBalance(m),
    0
  );
  const totalMonthlyPayment = property.mortgages.reduce(
    (sum: number, m: { monthlyPayment: unknown }) => sum + Number(m.monthlyPayment),
    0
  );
  const ownershipPercent = property.ownershipPercent ?? 100;
  const totalRent = getPropertyTotalRent(property);

  const computed = computePropertyMetrics({
    monthlyRent: totalRent,
    monthlyExpenses: Number(property.currentMonthlyExpenses),
    estimatedValue: Number(property.currentEstimatedValue),
    cashInvested: property.cashInvested != null ? Number(property.cashInvested) : null,
    totalMortgageBalance,
    totalMonthlyPayment,
    ownershipPercent,
    vacancyPercent: property.vacancyPercent ?? 5,
  });

  const propertyValue = Number(property.currentEstimatedValue);

  const annualDebtService = getAnnualDebtService(totalMonthlyPayment, ownershipPercent);
  const dscr = annualDebtService > 0 ? computed.noi / annualDebtService : null;

  const address = [
    property.addressLine1,
    property.addressLine2,
    property.city,
    property.state,
    property.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  const pageTitle = property.nickname?.trim() || property.addressLine1 || "Property";

  const unitRents = Array.isArray(property.unitRents)
    ? (property.unitRents as number[]).map((r) => (typeof r === "number" ? r : Number(r)))
    : null;

  const mortgageDataForDrawer: MortgageItem | null = property.mortgages[0] ?? null;
  const mortgages = property.mortgages.map((m) => {
    const projection = getPayoffProjection(m);
    return {
      id: m.id,
      effectiveBalance: getEffectiveBalance(m),
      interestRate: m.interestRate.toString(),
      termYears: m.termYears,
      monthlyPayment: m.monthlyPayment.toString(),
      lenderName: m.lenderName,
      balanceSource: getBalanceSource(m),
      balanceAsOfDate: m.balanceAsOfDate?.toISOString().slice(0, 10) ?? null,
      payoffProjection: {
        payoffDate: projection.payoffDate ? projection.payoffDate.toISOString().slice(0, 10) : null,
        remainingAtTermEnd: projection.remainingAtTermEnd,
      },
    };
  });

  const completeness = getPropertyCompleteness({
    purchasePrice: Number(property.purchasePrice),
    currentEstimatedValue: Number(property.currentEstimatedValue),
    cashInvested: property.cashInvested != null ? Number(property.cashInvested) : null,
    mortgageCount: property.mortgages.length,
    hasMortgage: property.hasMortgage ?? null,
    mortgagePaidOff: property.mortgagePaidOff ?? false,
  });

  const status = getPropertyStatus(
    {
      purchasePrice: Number(property.purchasePrice),
      currentEstimatedValue: Number(property.currentEstimatedValue),
      cashInvested: property.cashInvested != null ? Number(property.cashInvested) : null,
      mortgageCount: property.mortgages.length,
      hasMortgage: property.hasMortgage ?? null,
      mortgagePaidOff: property.mortgagePaidOff ?? false,
    },
    {
      monthlyCashFlow: computed.monthlyCashFlow,
      ltv: computed.ltv,
    },
    {
      isRented: property.isRented,
      userRent: totalRent,
      marketRent: property.marketRent != null ? Number(property.marketRent) : null,
      marketRentAsOf: property.marketRentAsOf,
    }
  );

  const drawerInitial = {
    mortgage: {
      hasMortgage: property.hasMortgage ?? null,
      mortgagePaidOff: property.mortgagePaidOff ?? false,
      existingMortgage: mortgageDataForDrawer
        ? {
            id: mortgageDataForDrawer.id,
            originalLoanAmount: mortgageDataForDrawer.originalLoanAmount.toString(),
            currentBalance: mortgageDataForDrawer.currentBalance.toString(),
            balanceAsOfDate:
              mortgageDataForDrawer.balanceAsOfDate?.toISOString().slice(0, 10) ?? null,
            interestRate: mortgageDataForDrawer.interestRate.toString(),
            termYears: mortgageDataForDrawer.termYears,
            startDate: mortgageDataForDrawer.startDate.toISOString().slice(0, 10),
            monthlyPayment: mortgageDataForDrawer.monthlyPayment.toString(),
            paymentEffectiveDate:
              mortgageDataForDrawer.paymentEffectiveDate?.toISOString().slice(0, 10) ?? null,
            escrowIncluded: mortgageDataForDrawer.escrowIncluded,
            escrowAmount:
              mortgageDataForDrawer.escrowAmount != null
                ? mortgageDataForDrawer.escrowAmount.toString()
                : null,
            lenderName: mortgageDataForDrawer.lenderName,
            loanType: mortgageDataForDrawer.loanType,
          }
        : undefined,
    },
    investmentDetails: {
      purchasePrice: Number(property.purchasePrice).toString(),
      cashInvested:
        property.cashInvested != null ? Number(property.cashInvested).toString() : "",
    },
    propertyFacts: {
      nickname: property.nickname ?? "",
      addressLine1: property.addressLine1 ?? "",
      addressLine2: property.addressLine2 ?? "",
      city: property.city ?? "",
      state: property.state ?? "",
      zipCode: property.zipCode ?? "",
      propertyType: property.propertyType,
      units: property.units.toString(),
      purchaseDate: property.purchaseDate.toISOString().slice(0, 10),
      purchasePrice: Number(property.purchasePrice).toString(),
      bedrooms: property.bedrooms != null ? property.bedrooms.toString() : "",
      bathrooms: property.bathrooms != null ? Number(property.bathrooms).toString() : "",
      squareFeet: property.squareFeet != null ? property.squareFeet.toString() : "",
      ownershipPercent: ownershipPercent.toString(),
    },
    rent: {
      isRented: property.isRented,
      currentMonthlyRent: Number(property.currentMonthlyRent).toString(),
      unitRents: Array.isArray(unitRents) ? unitRents.map((r) => r.toString()) : [],
      vacancyPercent: (property.vacancyPercent ?? 5).toString(),
      propertyType: property.propertyType,
      units: property.units,
    },
    financialInputs: {
      isRented: property.isRented,
      currentMonthlyRent: Number(property.currentMonthlyRent).toString(),
      unitRents: Array.isArray(unitRents) ? unitRents.map((r) => r.toString()) : [],
      vacancyPercent: (property.vacancyPercent ?? 5).toString(),
      currentMonthlyExpenses: Number(property.currentMonthlyExpenses).toString(),
      cashInvested:
        property.cashInvested != null ? Number(property.cashInvested).toString() : "",
      propertyType: property.propertyType,
      units: property.units,
    },
  };

  return (
    <PropertyDetailContent
      propertyId={property.id}
      pageTitle={pageTitle}
      address={address}
      property={{
        nickname: property.nickname,
        propertyType: property.propertyType,
        units: property.units,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms != null ? Number(property.bathrooms) : null,
        squareFeet: property.squareFeet,
        purchasePrice: Number(property.purchasePrice),
        purchaseDate: property.purchaseDate,
        currentEstimatedValue: Number(property.currentEstimatedValue),
        currentMonthlyExpenses: Number(property.currentMonthlyExpenses),
        isRented: property.isRented,
        unitRents,
        vacancyPercent: property.vacancyPercent,
        ownershipPercent,
        cashInvested: property.cashInvested != null ? Number(property.cashInvested) : null,
        marketRent: property.marketRent != null ? Number(property.marketRent) : null,
        marketRentAsOf: property.marketRentAsOf,
        estimatedValueAsOf: property.estimatedValueAsOf,
        hasMortgage: property.hasMortgage ?? null,
        mortgagePaidOff: property.mortgagePaidOff ?? false,
        updatedAt: property.updatedAt,
      }}
      totalRent={totalRent}
      mortgages={mortgages}
      metrics={{
        monthlyCashFlow: computed.monthlyCashFlow,
        equity: computed.equity,
        propertyValue,
        capRate: computed.capRate,
        cashOnCashReturn: computed.cashOnCashReturn,
        noi: computed.noi,
        grossAnnualRent: computed.grossAnnualRent,
        ltv: computed.ltv,
      }}
      dscr={dscr}
      status={status}
      completeness={completeness}
      drawerInitial={drawerInitial}
    />
  );
}
