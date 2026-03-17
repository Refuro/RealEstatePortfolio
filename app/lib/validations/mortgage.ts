import { z } from "zod";

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

export const createMortgageSchema = z.object({
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

export const updateMortgageSchema = createMortgageSchema.partial();

export type CreateMortgageInput = z.infer<typeof createMortgageSchema>;
export type UpdateMortgageInput = z.infer<typeof updateMortgageSchema>;
