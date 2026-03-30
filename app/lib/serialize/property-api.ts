import { parseUnitRentsFromDb } from "@/lib/validations/property";

type MortgageRow = {
  id: string;
  originalLoanAmount: { toString(): string };
  currentBalance: { toString(): string };
  interestRate: { toString(): string };
  monthlyPayment: { toString(): string };
  startDate: Date;
  paymentEffectiveDate: Date | null;
  balanceAsOfDate?: Date | null;
  escrowIncluded?: boolean;
  escrowAmount?: unknown;
  lenderName?: string | null;
  loanType?: string | null;
  [key: string]: unknown;
};

/**
 * JSON shape for GET /api/properties and GET/PATCH/POST responses (aligned with GET).
 */
export function serializePropertyForApi(p: {
  id: string;
  userId: string;
  nickname: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  units: number;
  ownershipPercent?: number;
  purchasePrice: { toString(): string };
  purchaseDate: Date;
  currentEstimatedValue: { toString(): string };
  currentMonthlyRent: { toString(): string };
  isRented: boolean;
  unitRents?: unknown;
  bedrooms?: number | null;
  bathrooms?: { toString(): string } | null;
  unitMix?: string | null;
  squareFeet?: number | null;
  currentMonthlyExpenses: { toString(): string };
  cashInvested: { toString(): string } | null;
  notes: string | null;
  marketRent?: { toString(): string } | null;
  marketRentAsOf?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  mortgages: MortgageRow[];
}) {
  return {
    ...p,
    purchasePrice: p.purchasePrice.toString(),
    purchaseDate: p.purchaseDate.toISOString().slice(0, 10),
    currentEstimatedValue: p.currentEstimatedValue.toString(),
    currentMonthlyRent: p.currentMonthlyRent.toString(),
    isRented: p.isRented,
    unitRents: parseUnitRentsFromDb(p.unitRents),
    bedrooms: p.bedrooms ?? null,
    bathrooms: p.bathrooms?.toString() ?? null,
    unitMix: p.unitMix ?? null,
    squareFeet: p.squareFeet ?? null,
    currentMonthlyExpenses: p.currentMonthlyExpenses.toString(),
    cashInvested: p.cashInvested?.toString() ?? null,
    marketRent: p.marketRent?.toString() ?? null,
    marketRentAsOf: p.marketRentAsOf?.toISOString().slice(0, 10) ?? null,
    ownershipPercent: p.ownershipPercent ?? 100,
    mortgages: p.mortgages.map((m) => ({
      ...m,
      originalLoanAmount: m.originalLoanAmount.toString(),
      currentBalance: m.currentBalance.toString(),
      interestRate: m.interestRate.toString(),
      monthlyPayment: m.monthlyPayment.toString(),
      startDate: m.startDate.toISOString().slice(0, 10),
      paymentEffectiveDate: m.paymentEffectiveDate?.toISOString().slice(0, 10) ?? null,
    })),
  };
}
