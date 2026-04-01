import { describe, expect, it } from "vitest";
import { getImportMortgageValidationError } from "./validate-import-mortgage";
import type { ImportRow } from "./csv-parser";

function baseRow(over: Partial<ImportRow> = {}): ImportRow {
  return {
    addressLine1: "1 Main",
    addressLine2: "",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    nickname: null,
    propertyType: "single_family",
    units: 1,
    purchasePrice: 200_000,
    purchaseDate: new Date("2020-01-01"),
    currentEstimatedValue: 250_000,
    currentMonthlyRent: 2000,
    unitRents: null,
    currentMonthlyExpenses: 500,
    vacancyPercent: 5,
    cashInvested: null,
    ownershipPercent: 100,
    isRented: true,
    mortgageBalance: null,
    balanceAsOfDate: null,
    originalLoanAmount: null,
    mortgageRate: null,
    mortgageTerm: null,
    mortgageStartDate: null,
    monthlyPayment: null,
    escrowAmount: null,
    lenderName: null,
    loanType: null,
    ...over,
  };
}

describe("getImportMortgageValidationError", () => {
  it("returns null when no mortgage fields", () => {
    expect(getImportMortgageValidationError(baseRow())).toBeNull();
  });

  it("returns error when P&I does not cover monthly interest", () => {
    const r = baseRow({
      mortgageBalance: 180_000,
      originalLoanAmount: 180_000,
      mortgageRate: 0.065,
      mortgageTerm: 30,
      monthlyPayment: 100,
      balanceAsOfDate: new Date("2024-01-01"),
    });
    const msg = getImportMortgageValidationError(r);
    expect(msg).toBeTruthy();
    expect(msg).toMatch(/P&I must cover/i);
  });

  it("returns error when escrow >= monthly payment", () => {
    const r = baseRow({
      mortgageBalance: 100_000,
      originalLoanAmount: 120_000,
      mortgageRate: 0.05,
      mortgageTerm: 30,
      monthlyPayment: 800,
      escrowAmount: 900,
      balanceAsOfDate: new Date("2024-01-01"),
    });
    const msg = getImportMortgageValidationError(r);
    expect(msg).toBeTruthy();
    expect(msg).toMatch(/escrow/i);
  });

  it("returns null for a typical amortizing mortgage row", () => {
    const r = baseRow({
      mortgageBalance: 180_000,
      originalLoanAmount: 200_000,
      mortgageRate: 0.065,
      mortgageTerm: 30,
      monthlyPayment: 1200,
      escrowAmount: 200,
      balanceAsOfDate: new Date("2024-01-01"),
    });
    expect(getImportMortgageValidationError(r)).toBeNull();
  });
});
