import { z } from "zod";
import { getPiForAmortization, isNegativeAmortizingPayment } from "@/lib/amortization";

export const LOAN_TYPE_OPTIONS = ["conventional", "FHA", "VA", "USDA", "jumbo", "other"] as const;
export type LoanType = (typeof LOAN_TYPE_OPTIONS)[number];

const loanTypeSchema = z
  .union([
    z.enum(LOAN_TYPE_OPTIONS),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .transform((v) => (v === "" || v == null ? null : v));

const decimalString = z
  .string()
  .refine((s) => !Number.isNaN(parseFloat(s)) && parseFloat(s) >= 0, "Must be a non-negative number")
  .transform((s) => (s.trim() === "" ? "0" : s));

const dateString = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date")
  .transform((s) => new Date(s));

const optionalDateString = z
  .union([
    z.null(),
    z.undefined(),
    z.literal(""),
    z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date"),
  ])
  .transform((s) => (s == null || s === "" ? null : new Date(s as string)));

const optionalEscrowAmount = z
  .union([
    z.null(),
    z.undefined(),
    z.literal(""),
    z.string().refine((s) => !Number.isNaN(parseFloat(s)) && parseFloat(s) >= 0, "Must be ≥ 0"),
  ])
  .transform((v) =>
    v == null || v === "" ? null : (parseFloat(String(v).trim()) || 0).toString()
  );

const createMortgageSchemaBase = z.object({
  originalLoanAmount: decimalString,
  currentBalance: decimalString,
  balanceAsOfDate: optionalDateString.optional().nullable(),
  interestRate: decimalString,
  termYears: z.coerce.number().int().min(1).max(50),
  startDate: dateString,
  monthlyPayment: decimalString,
  paymentEffectiveDate: optionalDateString.optional().nullable(),
  escrowIncluded: z.boolean().default(false),
  escrowAmount: optionalEscrowAmount.optional().nullable(),
  lenderName: z.string().max(200).optional().nullable(),
  loanType: loanTypeSchema.optional(),
});

/**
 * P&I (after escrow) must cover monthly interest on the current balance — no negative amortization.
 */
export function validateMortgagePiCoversInterestFields(data: {
  originalLoanAmount: string;
  currentBalance: string;
  interestRate: string;
  termYears: number;
  startDate: Date;
  monthlyPayment: string;
  escrowIncluded: boolean;
  escrowAmount?: string | null;
}): { ok: true } | { ok: false; message: string } {
  const pi = getPiForAmortization({
    originalLoanAmount: data.originalLoanAmount,
    currentBalance: data.currentBalance,
    interestRate: data.interestRate,
    termYears: data.termYears,
    startDate: data.startDate,
    monthlyPayment: data.monthlyPayment,
    escrowIncluded: data.escrowIncluded,
    escrowAmount: data.escrowAmount ?? null,
  });
  const balance = parseFloat(data.currentBalance);
  const rate = parseFloat(data.interestRate);
  if (balance <= 0 || rate < 0) return { ok: true };
  if (isNegativeAmortizingPayment(pi, balance, rate)) {
    return {
      ok: false,
      message:
        "P&I must cover the monthly interest on the current balance (increase payment, reduce escrow, or adjust balance/rate).",
    };
  }
  return { ok: true };
}

export const createMortgageSchema = createMortgageSchemaBase.superRefine((data, ctx) => {
  const r = validateMortgagePiCoversInterestFields({
    originalLoanAmount: data.originalLoanAmount,
    currentBalance: data.currentBalance,
    interestRate: data.interestRate,
    termYears: data.termYears,
    startDate: data.startDate,
    monthlyPayment: data.monthlyPayment,
    escrowIncluded: data.escrowIncluded,
    escrowAmount: data.escrowAmount ?? null,
  });
  if (!r.ok) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: r.message,
      path: ["monthlyPayment"],
    });
  }
});

/**
 * Validate escrow amount: when present and > 0, must be < monthlyPayment.
 * Call after schema parse when both values are available.
 */
export function validateEscrowAmount(
  escrowAmount: string | null | undefined,
  monthlyPayment: string
): { success: true } | { success: false; error: string } {
  const escrow =
    escrowAmount != null && escrowAmount !== "" ? parseFloat(escrowAmount) : null;
  const monthly = parseFloat(monthlyPayment);
  if (escrow == null || escrow === 0) return { success: true };
  if (escrow < 0) return { success: false, error: "Escrow amount must be ≥ 0" };
  if (escrow >= monthly)
    return { success: false, error: "Escrow amount must be less than monthly payment" };
  return { success: true };
}

/** Partial updates; P&I vs interest is enforced in PATCH after merge with existing row (`validateMortgagePiCoversInterestFields`). */
export const updateMortgageSchema = createMortgageSchemaBase.partial();

export type CreateMortgageInput = z.infer<typeof createMortgageSchema>;
export type UpdateMortgageInput = z.infer<typeof updateMortgageSchema>;
