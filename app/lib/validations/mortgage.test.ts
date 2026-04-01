import { describe, expect, it } from "vitest";
import {
  createMortgageSchema,
  validateEscrowAmount,
  validateMortgagePiCoversInterestFields,
} from "./mortgage";

const validCreate = {
  originalLoanAmount: "200000",
  currentBalance: "180000",
  interestRate: "0.065",
  termYears: 30,
  startDate: "2020-06-01",
  monthlyPayment: "1500",
  escrowIncluded: false,
};

describe("createMortgageSchema", () => {
  it("parses numeric strings and dates", () => {
    const r = createMortgageSchema.safeParse(validCreate);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.termYears).toBe(30);
      expect(r.data.startDate).toBeInstanceOf(Date);
    }
  });

  it("rejects invalid term years", () => {
    const r = createMortgageSchema.safeParse({ ...validCreate, termYears: 0 });
    expect(r.success).toBe(false);
  });

  it("rejects monthly payment when P&I does not cover interest on current balance", () => {
    const r = createMortgageSchema.safeParse({
      ...validCreate,
      currentBalance: "180000",
      monthlyPayment: "100",
      interestRate: "0.065",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors.monthlyPayment?.length).toBeGreaterThan(0);
    }
  });
});

describe("validateMortgagePiCoversInterestFields", () => {
  it("returns ok when payment covers interest", () => {
    expect(
      validateMortgagePiCoversInterestFields({
        originalLoanAmount: "200000",
        currentBalance: "180000",
        interestRate: "0.065",
        termYears: 30,
        startDate: new Date("2020-06-01"),
        monthlyPayment: "1500",
        escrowIncluded: false,
      })
    ).toEqual({ ok: true });
  });

  it("returns error when P&I is below monthly interest", () => {
    const r = validateMortgagePiCoversInterestFields({
      originalLoanAmount: "200000",
      currentBalance: "180000",
      interestRate: "0.065",
      termYears: 30,
      startDate: new Date("2020-06-01"),
      monthlyPayment: "100",
      escrowIncluded: false,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/P&I must cover/);
  });
});

describe("validateEscrowAmount", () => {
  it("allows zero or null escrow", () => {
    expect(validateEscrowAmount(null, "1500")).toEqual({ success: true });
    expect(validateEscrowAmount("0", "1500")).toEqual({ success: true });
  });

  it("rejects escrow >= monthly payment", () => {
    const r = validateEscrowAmount("1500", "1500");
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error).toMatch(/less than monthly payment/);
  });

  it("accepts escrow strictly below payment", () => {
    expect(validateEscrowAmount("400", "1500")).toEqual({ success: true });
  });
});
