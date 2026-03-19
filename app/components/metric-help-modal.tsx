"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const METRIC_DEFINITIONS = [
  {
    term: "Total property value",
    definition:
      "Sum of current estimated values across all your properties. This reflects your best estimate of what each property is worth today.",
  },
  {
    term: "Total debt",
    definition:
      "Sum of outstanding mortgage balances across all properties. In proportional mode this shows your ownership-scaled share; in full liability mode this shows 100% of balances.",
  },
  {
    term: "Total equity",
    definition:
      "Total property value minus total debt. This is your ownership stake — the portion of your properties you truly own.",
  },
  {
    term: "Monthly cash flow",
    definition:
      "Rent minus expenses minus mortgage payments, summed across all properties. Positive means you're making money each month; negative means you're subsidizing the properties.",
  },
  {
    term: "Portfolio cap rate",
    definition:
      "Weighted capitalization rate across your portfolio. Net operating income (rent minus expenses) divided by total property value. Higher cap rate generally means better yield.",
  },
  {
    term: "Portfolio LTV",
    definition:
      "Loan-to-value ratio for your portfolio: total debt divided by total property value. In full liability mode, debt can be 100% while value remains ownership-scaled, so LTV may increase materially.",
  },
  {
    term: "NOI (Net Operating Income)",
    definition:
      "Gross annual rent minus annual expenses. This is income before mortgage payments. For partial ownership, it reflects your share of NOI.",
  },
  {
    term: "Cash-on-cash return",
    definition:
      "Annual cash flow divided by cash invested. For partial ownership, uses your share of cash flow and invested capital. Shows the return on your actual money.",
  },
  {
    term: "Annual rent",
    definition:
      "Total gross rent collected per year across your portfolio. This is income before expenses and mortgage payments.",
  },
  {
    term: "DSCR",
    definition:
      "Debt service coverage ratio: NOI divided by annual debt service. In proportional mode, debt service is ownership-scaled; in full liability mode, debt service is 100%. Above 1.0 means income covers debt; below 1.0 means a shortfall.",
  },
];

export function MetricHelpModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement;
    const firstFocusable = containerRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        (previousActiveRef.current as HTMLElement)?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      (previousActiveRef.current as HTMLElement)?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="metric-help-title"
    >
      <div
        className="absolute inset-0 bg-foreground/20"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        className="relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4">
          <h2
            id="metric-help-title"
            className="text-lg font-semibold text-foreground"
          >
            What do these mean?
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-subtle hover:text-foreground"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <dl className="mt-4 space-y-4">
          {METRIC_DEFINITIONS.map(({ term, definition }) => (
            <div key={term}>
              <dt className="text-sm font-medium text-foreground">{term}</dt>
              <dd className="mt-1 text-sm text-muted">{definition}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
