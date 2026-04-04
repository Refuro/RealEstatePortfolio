import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  plan: z.enum(["investor", "pro"], {
    message: "Invalid or missing plan; use 'investor' or 'pro'",
  }),
  billingCycle: z.enum(["monthly", "yearly"]).optional().default("monthly"),
});

export type CreateCheckoutSessionInput = z.infer<
  typeof createCheckoutSessionSchema
>;

/** POST /api/billing/portal — optional JSON body (empty body uses defaults). */
export const billingPortalBodySchema = z
  .object({
    returnPath: z.string().optional(),
    targetPlan: z.enum(["investor", "pro"]).optional(),
    targetBillingCycle: z.enum(["monthly", "yearly"]).optional(),
  })
  .strict();

export type BillingPortalBodyInput = z.infer<typeof billingPortalBodySchema>;
