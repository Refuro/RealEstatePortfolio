"use client";

import Link from "next/link";

type WorkspaceNavMobileProps = {
  propertyHref: string;
  propertyLabel: string;
  modelingHref: string;
  mortgageHref: string;
};

export function WorkspaceNavMobile({
  propertyHref,
  propertyLabel,
  modelingHref,
  mortgageHref,
}: WorkspaceNavMobileProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Link
          href={propertyHref}
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-center text-sm font-medium text-foreground hover:bg-subtle"
        >
          {propertyLabel}
        </Link>
        <Link
          href={modelingHref}
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-center text-sm font-medium text-foreground hover:bg-subtle"
        >
          Modeling
        </Link>
        <Link
          href={mortgageHref}
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-center text-sm font-medium text-foreground hover:bg-subtle"
        >
          Mortgage
        </Link>
      </div>
      <Link
        href="/export/portfolio-summary"
        className="flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-background px-3 py-2.5 text-center text-sm font-medium text-foreground hover:bg-subtle"
      >
        Print portfolio summary
      </Link>
    </div>
  );
}
