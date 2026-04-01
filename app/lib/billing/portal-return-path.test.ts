import { describe, expect, it } from "vitest";
import { resolveBillingPortalReturnPath } from "./portal-return-path";

describe("resolveBillingPortalReturnPath", () => {
  it("defaults invalid or non-allowlisted values to /settings", () => {
    expect(resolveBillingPortalReturnPath(undefined)).toBe("/settings");
    expect(resolveBillingPortalReturnPath("https://evil.com")).toBe("/settings");
    expect(resolveBillingPortalReturnPath("/admin")).toBe("/settings");
  });

  it("allows known paths", () => {
    expect(resolveBillingPortalReturnPath("/plans")).toBe("/plans");
    expect(resolveBillingPortalReturnPath("/pricing")).toBe("/pricing");
    expect(resolveBillingPortalReturnPath("/settings")).toBe("/settings");
  });
});
