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

export const createMortgageSchema = z.object({
  originalLoanAmount: decimalString,
  currentBalance: decimalString,
  interestRate: decimalString,
  termYears: z.coerce.number().int().min(1).max(50),
  startDate: dateString,
  monthlyPayment: decimalString,
  escrowIncluded: z.boolean().default(false),
  lenderName: z.string().max(200).optional().nullable(),
  loanType: loanTypeSchema.optional(),
});

export const updateMortgageSchema = createMortgageSchema.partial();

export type CreateMortgageInput = z.infer<typeof createMortgageSchema>;
export type UpdateMortgageInput = z.infer<typeof updateMortgageSchema>;
