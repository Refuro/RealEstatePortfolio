import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "app/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "lib/metrics/**/*.ts",
        "lib/amortization.ts",
        "lib/benchmark-utils.ts",
        "lib/date-utils.ts",
        "lib/import/csv-parser.ts",
        "lib/validations/property.ts",
        "lib/validations/deal.ts",
        "lib/validations/mortgage.ts",
        "lib/validations/checkout.ts",
        "app/api/properties/route.ts",
        "app/api/properties/[id]/route.ts",
        "app/api/deals/route.ts",
      ],
      exclude: ["lib/**/*.test.ts", "lib/**/*.spec.ts", "app/**/*.test.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "."),
    },
  },
});
