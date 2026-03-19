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

const unitRentsSchema = z
  .array(z.number().min(0, "Each unit rent must be non-negative"))
  .optional()
  .nullable();

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
  propertyType: z
    .enum(["single_family", "condo", "townhouse", "manufactured", "multi_family", "apartment"])
    .default("single_family"),
  units: z.coerce.number().int().min(1).max(999).default(1),
  ownershipPercent: z.coerce.number().int().min(1).max(100).default(100),
  purchasePrice: decimalString,
  purchaseDate: dateString,
  currentEstimatedValue: decimalString,
  currentMonthlyRent: decimalString.optional(),
  unitRents: unitRentsSchema,
  bedrooms: z.coerce.number().int().min(1).max(10).optional().nullable(),
  bathrooms: z.coerce
    .number()
    .refine((n) => n >= 0.5 && n <= 10 && Number.isFinite(n), "Bathrooms must be 0.5–10")
    .refine((n) => (n * 2) % 1 === 0, "Bathrooms must use 0.5 steps (e.g. 1.5, 2)")
    .optional()
    .nullable(),
  unitMix: z.string().max(100).optional().nullable(),
  currentMonthlyExpenses: decimalString,
  vacancyPercent: z.coerce.number().int().min(0).max(100).default(5),
  cashInvested: z
    .string()
    .optional()
    .nullable()
    .transform((s) => (s === undefined ? undefined : s == null || s.trim() === "" ? null : s)),
  notes: z.string().max(2000).optional().nullable(),
  marketRent: z.union([z.string(), z.number()]).optional().nullable().transform((v) => {
    if (v === undefined) return undefined;
    if (v == null || v === "") return null;
    const n = typeof v === "number" ? v : parseFloat(String(v));
    return Number.isFinite(n) && n >= 0 ? n : null;
  }),
  marketRentAsOf: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date")
    .optional()
    .nullable()
    .transform((s) => {
      if (s === undefined) return undefined;
      return s && s.trim() ? new Date(s) : null;
    }),
});

const SINGLE_UNIT_TYPES = ["single_family", "condo", "townhouse", "manufactured"] as const;

const unitsRefine = (data: { propertyType?: string; units?: number }, ctx: z.RefinementCtx) => {
  const pt = data.propertyType;
  if (pt && SINGLE_UNIT_TYPES.includes(pt as (typeof SINGLE_UNIT_TYPES)[number]) && data.units !== undefined && data.units !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Units must be 1 for this property type",
      path: ["units"],
    });
  }
};

function parseRent(data: {
  currentMonthlyRent?: string;
  unitRents?: number[] | null;
}) {
  const currentMonthlyRent =
    data.currentMonthlyRent != null && data.currentMonthlyRent !== ""
      ? parseFloat(data.currentMonthlyRent)
      : NaN;
  const hasUnitRents = data.unitRents != null && data.unitRents.length > 0;
  const hasCurrentRent = !Number.isNaN(currentMonthlyRent) && currentMonthlyRent >= 0;
  return { hasUnitRents, hasCurrentRent, unitRents: data.unitRents };
}

const rentRefineCreate = (
  data: { propertyType?: string; units?: number; currentMonthlyRent?: string; unitRents?: number[] | null },
  ctx: z.RefinementCtx
) => {
  const units = data.units ?? 1;
  const { hasUnitRents, hasCurrentRent, unitRents } = parseRent(data);
  if (!hasUnitRents && !hasCurrentRent) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter monthly rent or per-unit rents",
      path: ["currentMonthlyRent"],
    });
    return;
  }
  if (data.propertyType === "multi_family" || data.propertyType === "apartment") {
    if (hasUnitRents && unitRents!.length !== units) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unit rents must have exactly ${units} values (one per unit)`,
        path: ["unitRents"],
      });
    }
  } else if (hasUnitRents && unitRents!.length !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Single-unit types should have one rent value",
      path: ["unitRents"],
    });
  }
};

const rentRefineUpdate = (
  data: { propertyType?: string; units?: number; currentMonthlyRent?: string; unitRents?: number[] | null },
  ctx: z.RefinementCtx
) => {
  const units = data.units ?? 1;
  const { hasUnitRents, hasCurrentRent, unitRents } = parseRent(data);
  if (!hasUnitRents && !hasCurrentRent) return;
  if (data.propertyType === "multi_family" || data.propertyType === "apartment") {
    if (hasUnitRents && unitRents!.length !== units) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Unit rents must have exactly ${units} values (one per unit)`,
        path: ["unitRents"],
      });
    }
  } else if (hasUnitRents && unitRents!.length !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Single-unit types should have one rent value",
      path: ["unitRents"],
    });
  }
};

export const createPropertySchema = propertySchemaBase
  .superRefine(unitsRefine)
  .superRefine(rentRefineCreate);

export const updatePropertySchema = propertySchemaBase.partial().superRefine(unitsRefine).superRefine(rentRefineUpdate);

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
