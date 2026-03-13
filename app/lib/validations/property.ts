import { z } from "zod";

const decimalString = z
  .string()
  .refine((s) => !Number.isNaN(parseFloat(s)) && parseFloat(s) >= 0, "Must be a non-negative number")
  .transform((s) => s.trim() === "" ? "0" : s);

const dateString = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date")
  .transform((s) => new Date(s));

export const createPropertySchema = z.object({
  nickname: z.string().max(200).optional().nullable(),
  addressLine1: z.string().min(1, "Address is required").max(200),
  addressLine2: z.string().max(200).optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(50),
  zipCode: z.string().min(1, "ZIP is required").max(20),
  propertyType: z.enum(["single_family", "multi_family"]).default("single_family"),
  units: z.coerce.number().int().min(1).max(999).default(1),
  purchasePrice: decimalString,
  purchaseDate: dateString,
  currentEstimatedValue: decimalString,
  currentMonthlyRent: decimalString,
  currentMonthlyExpenses: decimalString,
  cashInvested: z.string().optional().nullable().transform((s) => (s == null || s.trim() === "" ? null : s)),
  notes: z.string().max(2000).optional().nullable(),
});

export const updatePropertySchema = createPropertySchema.partial();

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
