import { z } from "zod";
import { US_STATES } from "@/lib/us-states";

const decimalString = z
  .string()
  .refine((s) => !Number.isNaN(parseFloat(s)) && parseFloat(s) >= 0, "Must be a non-negative number")
  .transform((s) => (s.trim() === "" ? "0" : s));

const optionalDecimalString = z
  .string()
  .optional()
  .nullable()
  .transform((s) => (s == null || s.trim() === "" ? null : s));

const dealSchemaBase = z.object({
  nickname: z.string().max(200).optional().nullable(),
  addressLine1: z.string().min(1, "Address is required").max(200),
  addressLine2: z.string().max(200).optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: z
    .string()
    .min(1, "State is required")
    .refine(
      (s) => US_STATES.includes(s.toUpperCase() as (typeof US_STATES)[number]),
      "Invalid state. Use 2-letter abbreviation (e.g. TX, CA)."
    )
    .transform((s) => s.toUpperCase()),
  zipCode: z.string().min(1, "ZIP is required").max(20),
  purchasePrice: optionalDecimalString,
  currentEstimatedValue: optionalDecimalString,
  currentMonthlyRent: decimalString,
  currentMonthlyExpenses: decimalString,
  totalMortgageBalance: z.string().optional().nullable().transform((s) => (s == null || s.trim() === "" ? "0" : s)),
  totalMonthlyPayment: z.string().optional().nullable().transform((s) => (s == null || s.trim() === "" ? "0" : s)),
  ownershipPercent: z.coerce.number().int().min(1).max(100).default(100),
  vacancyPercent: z.coerce.number().int().min(0).max(100).default(5),
  cashInvested: optionalDecimalString,
  notes: z.string().max(2000).optional().nullable(),
});

export const createDealSchema = dealSchemaBase.superRefine((data, ctx) => {
  const purchasePrice = data.purchasePrice ? parseFloat(data.purchasePrice) : NaN;
  const currentValue = data.currentEstimatedValue ? parseFloat(data.currentEstimatedValue) : NaN;
  const hasPrice = !Number.isNaN(purchasePrice) && purchasePrice > 0;
  const hasValue = !Number.isNaN(currentValue) && currentValue > 0;
  if (!hasPrice && !hasValue) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Either purchase price or current estimated value is required",
      path: ["purchasePrice"],
    });
  }
});

export const updateDealSchema = dealSchemaBase.partial();

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
