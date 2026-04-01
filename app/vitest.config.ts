import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    // Component tests: use @vitest-environment jsdom at top of components/*.test.tsx
    setupFiles: [path.resolve(dirname, "vitest.setup.ts")],
    include: ["lib/**/*.test.ts", "app/**/*.test.ts", "components/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "lib/metrics/**/*.ts",
        "lib/amortization.ts",
        "lib/plans.ts",
        "lib/str-ltr-calculator.ts",
        "lib/fix-and-flip-calculator.ts",
        "lib/benchmark-utils.ts",
        "lib/date-utils.ts",
        "lib/import/csv-parser.ts",
        "lib/validations/property.ts",
        "lib/validations/deal.ts",
        "lib/validations/mortgage.ts",
        "lib/validations/checkout.ts",
        "app/app/api/properties/route.ts",
        "app/app/api/properties/[id]/route.ts",
        "app/app/api/properties/[id]/metrics/route.ts",
        "app/app/api/deals/route.ts",
        "app/app/api/deals/[id]/route.ts",
        "app/app/api/billing/webhook/route.ts",
        "app/app/api/billing/create-checkout-session/route.ts",
        "app/app/api/portfolio/summary/route.ts",
        "app/app/api/export/portfolio/route.ts",
        "app/app/api/import/portfolio/route.ts",
        "app/app/api/account/delete/route.ts",
        "app/app/api/account/delete-permanent/route.ts",
      ],
      exclude: [
        "lib/**/*.test.ts",
        "lib/**/*.spec.ts",
        "app/**/*.test.ts",
        "components/**/*.test.tsx",
      ],
      thresholds: {
        statements: 80,
        branches: 58,
        functions: 78,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "."),
    },
  },
});
