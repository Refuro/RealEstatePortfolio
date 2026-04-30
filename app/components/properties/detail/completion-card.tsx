"use client";

import { Check, Zap } from "lucide-react";
import { useIsMobile } from "@/lib/use-is-mobile";

export type SectionStatus = {
  label: string;
  hint: string;
  complete: boolean;
};

export type CompletionCardProps = {
  score: number;
  /**
   * Section status row at the bottom — drives the pill grid. Each pill shows
   * a check when complete and a dim outline when not. The parent owns the math.
   */
  sections: SectionStatus[];
  /** Opens the wizard. */
  onContinue?: () => void;
};

export function CompletionCard({ score, sections, onContinue }: CompletionCardProps) {
  const isMobile = useIsMobile();
  if (score >= 100) return null;

  const completedCount = sections.filter((s) => s.complete).length;
  const totalCount = sections.length;
  const missingCount = totalCount - completedCount;

  // Mobile uses a single-line subtitle (matches mockup); desktop fans it out.
  const desktopSubtitle = `${completedCount} of ${totalCount} sections complete · adds DSCR, LTV, rent benchmark, and refinance modeling`;
  const mobileSubtitle = `${missingCount} of ${totalCount} sections missing`;
  const headline = isMobile
    ? "Complete your profile"
    : "Complete this profile to unlock full metrics";
  const ctaLabel = isMobile ? "Continue" : "Continue completing →";

  return (
    <section
      className="rounded-xl border p-3 shadow-sm md:p-5"
      style={{
        background: "color-mix(in srgb, var(--warning) 7%, var(--card))",
        borderColor: "color-mix(in srgb, var(--warning) 36%, var(--border))",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2 md:gap-2.5">
          {!isMobile && (
            <Zap className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold leading-tight text-foreground md:text-[17px]">
              {headline}
            </h2>
            <p className="mt-0.5 text-xs text-muted md:mt-1 md:text-sm">
              {isMobile ? mobileSubtitle : desktopSubtitle}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onContinue}
          disabled={!onContinue}
          className="inline-flex min-h-[32px] shrink-0 items-center rounded-md px-3 py-1.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:min-h-[36px] md:px-4 md:py-2"
          style={{
            background: "var(--warning-button)",
            color: "#0a0a0a",
          }}
        >
          {ctaLabel}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3 md:mt-4">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full"
          style={{ background: "color-mix(in srgb, var(--warning) 14%, var(--border))" }}
          aria-hidden
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${score}%`,
              background: "var(--warning)",
            }}
          />
        </div>
        <span className="shrink-0 tabular-nums text-xs font-semibold text-warning">
          {score}%
        </span>
      </div>

      <div
        className={
          isMobile
            ? `mt-3 grid gap-1.5 ${gridCols(totalCount)}`
            : "mt-4 grid grid-cols-2 gap-2 md:grid-cols-4"
        }
      >
        {sections.map((section) => (
          <SectionPill key={section.label} section={section} compact={isMobile} />
        ))}
      </div>
    </section>
  );
}

function gridCols(n: number): string {
  // Mobile: pack pills tight. 4 sections → 4 cols at 390px is too tight,
  // so use 2 rows when there are >3.
  if (n <= 2) return "grid-cols-2";
  if (n <= 4) return "grid-cols-2";
  return "grid-cols-3";
}

function SectionPill({
  section,
  compact = false,
}: {
  section: SectionStatus;
  compact?: boolean;
}) {
  const { complete, label, hint } = section;
  return (
    <div
      className={`flex items-center gap-1.5 rounded-md border ${
        compact ? "px-2 py-1.5" : "items-start gap-2 rounded-lg px-2.5 py-2"
      }`}
      style={
        complete
          ? {
              background: "var(--positive-dim)",
              borderColor: "color-mix(in srgb, var(--positive) 28%, var(--border))",
            }
          : {
              background: "transparent",
              borderColor: "var(--border-subtle)",
            }
      }
    >
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full ${
          compact ? "size-3.5" : "mt-0.5 size-4"
        }`}
        style={
          complete
            ? { background: "var(--positive)", color: "var(--card)" }
            : {
                background: "transparent",
                border: "1.5px solid var(--fg-dimmer)",
              }
        }
        aria-hidden
      >
        {complete && <Check className={compact ? "size-2" : "size-2.5"} strokeWidth={3} />}
      </span>
      <div className="min-w-0">
        <div
          className="truncate text-[11px] font-semibold leading-tight"
          style={{
            color: complete ? "var(--positive)" : "var(--foreground-muted)",
          }}
        >
          {label}
        </div>
        {!compact && (
          <div className="mt-0.5 text-[10px] leading-tight text-muted">{hint}</div>
        )}
      </div>
    </div>
  );
}
