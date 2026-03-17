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
