import { describe, expect, it } from "vitest";
import { createCheckoutSessionSchema } from "./checkout";

describe("createCheckoutSessionSchema", () => {
  it("accepts investor and pro plans", () => {
    expect(createCheckoutSessionSchema.safeParse({ plan: "investor" }).success).toBe(true);
    expect(createCheckoutSessionSchema.safeParse({ plan: "pro" }).success).toBe(true);
  });

  it("defaults billing cycle to monthly", () => {
    const r = createCheckoutSessionSchema.safeParse({ plan: "pro" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.billingCycle).toBe("monthly");
  });

  it("rejects invalid plan", () => {
    expect(createCheckoutSessionSchema.safeParse({ plan: "enterprise" }).success).toBe(false);
  });
});
