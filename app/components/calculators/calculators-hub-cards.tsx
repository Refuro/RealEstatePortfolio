import Link from "next/link";

export type CalculatorsHubVariant = "public" | "app";

/**
 * Shared calculator hub cards. Public variant uses SEO URLs; app variant keeps users in the shell.
 * Order: rental (broadest) → BRRRR → STR vs LTR → fix-and-flip.
 */
export function CalculatorsHubCards({ variant }: { variant: CalculatorsHubVariant }) {
  const brrrHref = variant === "public" ? "/tools/brrr" : "/calculators/brrr";
  const rentalHref =
    variant === "public"
      ? "/investment-property-calculator"
      : "/calculators/investment-property-calculator";
  const strLtrHref = variant === "public" ? "/tools/str-vs-ltr" : "/calculators/str-vs-ltr";
  const fixFlipHref = variant === "public" ? "/tools/fix-and-flip" : "/calculators/fix-and-flip";

  return (
    <ul className="mt-10 space-y-4">
      <li>
        <Link
          href={rentalHref}
          className="block rounded-xl border border-border bg-card/95 p-5 shadow-sm transition hover:border-accent/30 hover:bg-subtle"
        >
          <h2 className="text-lg font-semibold text-foreground">Investment property calculator</h2>
          <p className="mt-1 text-sm text-muted">
            Monthly cash flow, cap rate, DSCR, and cash-on-cash for a stabilized rental.
          </p>
          <p className="mt-3 text-sm font-medium text-accent">Open calculator →</p>
        </Link>
      </li>
      <li>
        <Link
          href={brrrHref}
          className="block rounded-xl border border-border bg-card/95 p-5 shadow-sm transition hover:border-accent/30 hover:bg-subtle"
        >
          <h2 className="text-lg font-semibold text-foreground">BRRRR calculator</h2>
          <p className="mt-1 text-sm text-muted">
            Buy, rehab, rent, refinance—estimate cash-out at refi and stabilized cash flow vs. ARV.
          </p>
          <p className="mt-3 text-sm font-medium text-accent">Open calculator →</p>
        </Link>
      </li>
      <li>
        <Link
          href={strLtrHref}
          className="block rounded-xl border border-border bg-card/95 p-5 shadow-sm transition hover:border-accent/30 hover:bg-subtle"
        >
          <h2 className="text-lg font-semibold text-foreground">STR vs LTR</h2>
          <p className="mt-1 text-sm text-muted">
            Compare short-term (STR) and long-term rental (LTR) income, expenses, and cash flow side by
            side on the same financing.
          </p>
          <p className="mt-3 text-sm font-medium text-accent">Open calculator →</p>
        </Link>
      </li>
      <li>
        <Link
          href={fixFlipHref}
          className="block rounded-xl border border-border bg-card/95 p-5 shadow-sm transition hover:border-accent/30 hover:bg-subtle"
        >
          <h2 className="text-lg font-semibold text-foreground">Fix and flip</h2>
          <p className="mt-1 text-sm text-muted">
            Estimate net profit, ROI, and annualized return on a flip — purchase, rehab, hold, and
            sale.
          </p>
          <p className="mt-3 text-sm font-medium text-accent">Open calculator →</p>
        </Link>
      </li>
    </ul>
  );
}
