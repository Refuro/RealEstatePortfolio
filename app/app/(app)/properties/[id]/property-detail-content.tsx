"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";
import { useIsMobile } from "@/lib/use-is-mobile";
import { KpiStrip, type KpiMetric } from "@/components/ui/kpi-strip";
import { DetailHero } from "@/components/properties/detail/detail-hero";
import {
  CompletionCard,
  type SectionStatus,
} from "@/components/properties/detail/completion-card";
import { MortgageSection } from "@/components/properties/detail/mortgage-section";
import { PropertyFactsCard } from "@/components/properties/detail/property-facts-card";
import { FinancialInputsCard } from "@/components/properties/detail/financial-inputs-card";
import { PerformanceCard } from "@/components/properties/detail/performance-card";
import { DataFreshnessCard } from "@/components/properties/detail/data-freshness-card";
import { EditDrawer, type EditDrawerInitialData, type EditSection } from "./edit-drawer";
import type { PropertyStatus } from "@/lib/property-status";

type MortgageDisplay = {
  id: string;
  effectiveBalance: number;
  interestRate: string;
  termYears: number;
  monthlyPayment: string;
  lenderName: string | null;
  balanceSource?: "stored" | "stored_projected" | "projected";
  balanceAsOfDate?: string | null;
  payoffProjection?: { payoffDate: string | null; remainingAtTermEnd: number | null };
};

export type PropertyDetailContentProps = {
  propertyId: string;
  pageTitle: string;
  address: string;
  property: {
    nickname: string | null;
    propertyType: string;
    units: number;
    bedrooms: number | null;
    bathrooms: number | null;
    squareFeet: number | null;
    purchasePrice: number;
    purchaseDate: Date | string;
    currentEstimatedValue: number;
    currentMonthlyExpenses: number;
    isRented: boolean;
    unitRents: number[] | null;
    vacancyPercent: number | null;
    cashInvested: number | null;
    marketRent: number | null;
    marketRentAsOf: Date | string | null;
    estimatedValueAsOf: Date | string | null;
    hasMortgage: boolean | null;
    mortgagePaidOff: boolean;
    updatedAt: Date | string;
  };
  totalRent: number;
  mortgages: MortgageDisplay[];
  metrics: {
    monthlyCashFlow: number;
    equity: number;
    propertyValue: number;
    capRate: number | null;
    cashOnCashReturn: number | null;
    noi: number;
    grossAnnualRent: number;
    ltv: number | null;
  };
  dscr: number | null;
  status: PropertyStatus;
  completeness: { score: number; missingFields: string[] };
  drawerInitial: EditDrawerInitialData;
};

export function PropertyDetailContent({
  propertyId,
  pageTitle,
  address,
  property,
  totalRent,
  mortgages,
  metrics,
  dscr,
  status,
  completeness,
  drawerInitial,
}: PropertyDetailContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const openSection = useCallback(
    (section: EditSection) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("edit", section);
      params.delete("wizard");
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const openWizard = useCallback(() => {
    // Pick first incomplete wizard step from current missingFields.
    // Mortgage comes first per HANDOFF wizard order. Fall back to mortgage if
    // missingFields somehow omits both (defensive — completion card is only
    // visible at score < 100).
    const m = completeness.missingFields;
    const mortgageMissing =
      m.includes("mortgage details") || m.includes("mortgage status");
    const investmentMissing =
      m.includes("actual purchase price") || m.includes("cash invested");
    const first: EditSection = mortgageMissing
      ? "mortgage"
      : investmentMissing
      ? "investment-details"
      : "mortgage";
    const params = new URLSearchParams(searchParams.toString());
    params.set("edit", first);
    params.set("wizard", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams, completeness.missingFields]);

  const kpis = buildKpis({ metrics, dscr, hasMortgage: property.hasMortgage });

  return (
    <div>
      <DetailHero
        name={pageTitle}
        address={address}
        propertyType={property.propertyType}
        units={property.units}
        status={status}
        actions={<BreadcrumbActions propertyId={propertyId} />}
      />

      <div className="mt-4 md:mt-6">
        <KpiStrip metrics={kpis} desktopCols={5} />
      </div>

      {completeness.score < 100 && (
        <div className="mt-3 md:mt-5">
          <CompletionCard
            score={completeness.score}
            sections={buildSectionStatus({
              missingFields: completeness.missingFields,
              marketRent: property.marketRent,
            })}
            onContinue={openWizard}
          />
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 md:mt-6 md:gap-5 lg:grid-cols-[1fr_minmax(280px,360px)]">
        <div className="space-y-3 md:space-y-5">
          <PropertyFactsCard
            nickname={property.nickname}
            address={address}
            propertyType={property.propertyType}
            units={property.units}
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            squareFeet={property.squareFeet}
            purchaseDate={property.purchaseDate}
            purchasePrice={property.purchasePrice}
            onEdit={() => openSection("property-facts")}
          />
          <FinancialInputsCard
            totalRent={totalRent}
            unitRents={property.unitRents}
            isRented={property.isRented}
            currentMonthlyExpenses={property.currentMonthlyExpenses}
            vacancyPercent={property.vacancyPercent}
            cashInvested={property.cashInvested}
            grossAnnualRent={metrics.grossAnnualRent}
            noi={metrics.noi}
            onEdit={() => openSection("financial-inputs")}
          />
          <MortgageSection
            propertyId={propertyId}
            hasMortgage={property.hasMortgage}
            mortgagePaidOff={property.mortgagePaidOff}
            mortgages={mortgages}
            onEdit={() => openSection("mortgage")}
            onAddMortgage={() => openSection("mortgage")}
          />
        </div>
        <div className="space-y-3 md:space-y-5">
          <PerformanceCard
            capRate={metrics.capRate}
            cashOnCashReturn={metrics.cashOnCashReturn}
            noi={metrics.noi}
            grossAnnualRent={metrics.grossAnnualRent}
            dscr={dscr}
            ltv={metrics.ltv}
            hasMortgage={property.hasMortgage}
          />
          <DataFreshnessCard
            propertyUpdatedAt={property.updatedAt}
            estimatedValueAsOf={property.estimatedValueAsOf}
            marketRentAsOf={property.marketRentAsOf}
            isRented={property.isRented}
            totalRent={totalRent}
            marketRent={property.marketRent}
          />
        </div>
      </div>

      <EditDrawer
        propertyId={propertyId}
        initial={drawerInitial}
        completeness={completeness}
      />
    </div>
  );
}

function buildSectionStatus({
  missingFields,
  marketRent,
}: {
  missingFields: string[];
  marketRent: number | null;
}): SectionStatus[] {
  const investmentMissing =
    missingFields.includes("actual purchase price") ||
    missingFields.includes("cash invested");
  const mortgageMissing =
    missingFields.includes("mortgage details") ||
    missingFields.includes("mortgage status");
  const benchmarkComplete = marketRent != null;
  return [
    {
      label: "Property facts",
      hint: "Address, type, purchase date",
      complete: true,
    },
    {
      label: "Financial inputs",
      hint: "Purchase price, rent, expenses",
      complete: !investmentMissing,
    },
    {
      label: "Rent benchmark",
      hint: "Enables rent vs market signal",
      complete: benchmarkComplete,
    },
    {
      label: "Mortgage details",
      hint: "Loan amount, rate, term",
      complete: !mortgageMissing,
    },
  ];
}

function buildKpis({
  metrics,
  dscr,
  hasMortgage,
}: {
  metrics: PropertyDetailContentProps["metrics"];
  dscr: number | null;
  hasMortgage: boolean | null;
}): KpiMetric[] {
  const cf = metrics.monthlyCashFlow;

  let dscrValue: string;
  let dscrHint: string;
  if (hasMortgage === null) {
    dscrValue = "—";
    dscrHint = "Add mortgage";
  } else if (hasMortgage === false) {
    dscrValue = "N/A";
    dscrHint = "No active loan";
  } else {
    dscrValue = dscr != null ? dscr.toFixed(2) : "—";
    dscrHint =
      dscr == null
        ? "Add loan details"
        : dscr >= 1.25
        ? "Competitive refi terms"
        : dscr >= 1.0
        ? "Debt service covered"
        : "Below access minimum";
  }

  return [
    {
      label: "Cash flow",
      value: `${cf < 0 ? "−" : ""}${formatCurrency(Math.abs(cf))}`,
      hint: cf >= 0 ? "Monthly net" : "Monthly net (negative)",
      valueColor: cf < 0 ? "neg" : cf > 0 ? "pos" : "neutral",
    },
    {
      label: "Equity",
      value: formatCurrency(metrics.equity),
      hint:
        metrics.propertyValue > 0
          ? `${((metrics.equity / metrics.propertyValue) * 100).toFixed(1)}% of value`
          : "—",
    },
    {
      label: "Property value",
      value: formatCurrency(metrics.propertyValue),
      hint: "Estimated value",
      hideOnMobile: true,
    },
    {
      label: "Cap rate",
      value: metrics.capRate != null ? `${(metrics.capRate * 100).toFixed(2)}%` : "—",
      hint: "Annual NOI ÷ value",
    },
    {
      label: "DSCR",
      value: dscrValue,
      hint: dscrHint,
    },
  ];
}

function BreadcrumbActions({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/properties");
        router.refresh();
      }
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  if (isMobile) {
    return (
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Property actions"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-transparent text-foreground transition-colors hover:bg-subtle"
        >
          <MoreHorizontal className="size-5" aria-hidden />
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-md border border-border bg-card shadow-lg"
          >
            <Link
              role="menuitem"
              href={`/modeling?propertyId=${encodeURIComponent(propertyId)}`}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Open in Modeling
            </Link>
            <Link
              role="menuitem"
              href={`/refinance?propertyId=${encodeURIComponent(propertyId)}`}
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Open in Refinance
            </Link>
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setConfirmOpen(true);
              }}
              className="block w-full px-3 py-2.5 text-left text-sm font-medium text-negative hover:bg-negative/10"
            >
              Delete
            </button>
          </div>
        )}
        {confirmOpen && (
          <div
            role="dialog"
            aria-label="Confirm delete"
            className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40 p-4 sm:items-center"
          >
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4 shadow-xl">
              <p className="text-sm font-medium text-foreground">
                Delete this property?
              </p>
              <p className="mt-1 text-xs text-muted">
                This permanently removes the property and its mortgages.
              </p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  disabled={deleting}
                  className="inline-flex min-h-[36px] items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-subtle disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex min-h-[36px] items-center rounded-md bg-negative px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/modeling?propertyId=${encodeURIComponent(propertyId)}`}
        className="inline-flex min-h-[36px] items-center rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-subtle"
      >
        Open in Modeling
      </Link>
      <Link
        href={`/refinance?propertyId=${encodeURIComponent(propertyId)}`}
        className="inline-flex min-h-[36px] items-center rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-subtle"
      >
        Open in Refinance
      </Link>
      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="inline-flex min-h-[36px] items-center rounded-md border border-negative/30 px-3 py-1.5 text-sm font-medium text-negative transition-colors hover:bg-negative/10"
        >
          Delete
        </button>
      ) : (
        <span className="flex items-center gap-2">
          <span className="text-sm text-muted">Delete?</span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex min-h-[36px] items-center rounded-md bg-negative px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Yes"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(false)}
            disabled={deleting}
            className="inline-flex min-h-[36px] items-center rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-subtle"
          >
            No
          </button>
        </span>
      )}
    </div>
  );
}
