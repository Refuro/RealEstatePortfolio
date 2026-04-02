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
    <div className="rounded-xl border border-border bg-card/70 p-2 shadow-sm">
      <p className="px-1 text-xs font-medium text-muted">Quick workspace links</p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        <Link
          href={propertyHref}
          className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
        >
          {propertyLabel}
        </Link>
        <Link
          href={modelingHref}
          className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
        >
          Modeling
        </Link>
        <Link
          href={mortgageHref}
          className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
        >
          Mortgage
        </Link>
      </div>
      <Link
        href="/export/portfolio-summary"
        className="mt-1 inline-flex min-h-11 items-center px-1 text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:text-accent"
      >
        Print portfolio summary
      </Link>
    </div>
  );
}
