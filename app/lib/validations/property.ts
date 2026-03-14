import { z } from "zod";
import { US_STATES } from "@/lib/us-states";

const decimalString = z
  .string()
  .refine((s) => !Number.isNaN(parseFloat(s)) && parseFloat(s) >= 0, "Must be a non-negative number")
  .transform((s) => s.trim() === "" ? "0" : s);

const dateString = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date")
  .transform((s) => new Date(s));

const propertySchemaBase = z.object({
  nickname: z.string().max(200).optional().nullable(),
  addressLine1: z.string().min(1, "Address is required").max(200),
  addressLine2: z.string().max(200).optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: z
    .string()
    .min(1, "State is required")
    .refine((s) => US_STATES.includes(s.toUpperCase() as (typeof US_STATES)[number]), "Invalid state. Use 2-letter abbreviation (e.g. TX, CA).")
    .transform((s) => s.toUpperCase()),
  zipCode: z.string().min(1, "ZIP is required").max(20),
  propertyType: z.enum(["single_family", "multi_family"]).default("single_family"),
  units: z.coerce.number().int().min(1).max(999).default(1),
  ownershipPercent: z.coerce.number().int().min(1).max(100).default(100),
  purchasePrice: decimalString,
  purchaseDate: dateString,
  currentEstimatedValue: decimalString,
  currentMonthlyRent: decimalString,
  currentMonthlyExpenses: decimalString,
  cashInvested: z.string().optional().nullable().transform((s) => (s == null || s.trim() === "" ? null : s)),
  notes: z.string().max(2000).optional().nullable(),
});

const unitsRefine = (data: { propertyType?: string; units?: number }, ctx: z.RefinementCtx) => {
  if (data.propertyType === "single_family" && data.units !== undefined && data.units !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Units must be 1 for single-family properties",
      path: ["units"],
    });
  }
};

export const createPropertySchema = propertySchemaBase.superRefine(unitsRefine);

export const updatePropertySchema = propertySchemaBase.partial().superRefine(unitsRefine);

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
