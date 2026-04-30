/**
 * refi_gap generator.
 *
 * Single mode only (per discussion doc decisions #4 and #5). Multi-mode
 * portfolio refi gap doesn't map cleanly to a single action because each
 * mortgage is independent.
 *
 * Fires when the property has a mortgage and DSCR is below 1.25 — the
 * threshold most lenders use for competitive refi terms (NOT the access
 * minimum, which is 1.0). Computes the monthly rent increase that would
 * close the gap to DSCR 1.25.
 *
 * Severity: warning (always — no escalation per decision #5; DSCR < 1.0
 * already triggers cash_flow_drag, so escalating here would double-up the
 * negative slot).
 * Score:    monthly rent increase needed (smaller = closer to refi-ready).
 *
 * Math + threshold constants live in `app/lib/refi-ready.ts` (the single
 * source of truth for refi-readiness, also consumed by the Properties task
 * center). This generator is a thin wrapper: it gates on insights-engine
 * concerns and delegates the rent-required calculation.
 */

import type { Generator, Insight, InsightsContext } from "../types";
import { refiGapCopy } from "../copy";
import {
  REFI_TARGET_DSCR,
  REFI_MAX_VACANCY_PCT,
  computeRentForTargetDscr,
} from "@/lib/refi-ready";

const TYPE = "refi_gap" as const;
const ACCESS_MINIMUM_DSCR = 1.0;

export const refiGapGenerator: Generator = {
  type: TYPE,
  appliesTo: ["single"] as const,
  generate(ctx: InsightsContext): Insight[] {
    if (ctx.mode !== "single") return [];
    const property = ctx.properties[0];
    const metrics = ctx.metrics[0];
    if (!property || !metrics) return [];

    // Gating: must have a mortgage with debt service.
    if (!metrics.annualDebtService || metrics.annualDebtService <= 0) return [];
    if (metrics.dscr == null) return [];

    // Already above target — refi-eligible at competitive rates, no insight needed.
    if (metrics.dscr >= REFI_TARGET_DSCR) return [];

    // Vacancy edge case — math gets unreliable at very high vacancy.
    if (property.vacancyPercent >= REFI_MAX_VACANCY_PCT) return [];

    const targetMonthlyRent = computeRentForTargetDscr({
      annualDebtService: metrics.annualDebtService,
      monthlyExpenses: property.monthlyExpenses,
      vacancyPercent: property.vacancyPercent,
    });
    if (targetMonthlyRent == null) return [];

    const rentIncreaseNeeded = targetMonthlyRent - property.userRent;
    if (rentIncreaseNeeded <= 0) return []; // defensive — should be caught by DSCR gate

    const copy = refiGapCopy.single({
      rentIncreaseNeeded,
      currentDscr: metrics.dscr,
      belowAccessMinimum: metrics.dscr < ACCESS_MINIMUM_DSCR,
    });

    // Thread propertyId into the modeling href so the link lands on the
    // modeling page already scoped to this property.
    const cta = copy.cta
      ? {
          ...copy.cta,
          href: `${copy.cta.href}?propertyId=${encodeURIComponent(property.id)}`,
        }
      : undefined;

    return [
      {
        type: TYPE,
        severity: "warning",
        eyebrow: copy.eyebrow,
        value: copy.value,
        explanation: copy.explanation,
        cta,
        dismissKey: `${TYPE}:${property.id}`,
        dismissThreshold: {
          metric: "rentIncreaseNeeded",
          value: rentIncreaseNeeded,
          deltaPct: 10,
        },
        score: rentIncreaseNeeded,
      },
    ];
  },
};
