/**
 * equity_built generator.
 *
 * Captures the cumulative wealth-creation arc since purchase. Different
 * timeframe than total_return (which is annualized) — this is "how much
 * equity have you actually built since you bought this?"
 *
 * Single mode: fires per property; multi mode: aggregates across portfolio.
 *
 * Severity: positive (always when firing).
 * Score:    dollars of equity built.
 *
 * Gating per discussion doc decision #8:
 *   - Held < 12 months   → skip ("since purchase" framing meaningless)
 *   - Negative equity built → skip (would produce negative number)
 *   - Built < $10,000   → skip (small wins read flat; doesn't earn the slot)
 *
 * If `cashInvested` is missing, the multiplier is dropped from copy — the
 * insight still fires with bare-dollar framing.
 */

import type { Generator, Insight, InsightsContext } from "../types";
import { equityBuiltCopy } from "../copy";

const TYPE = "equity_built" as const;
const MIN_HOLD_DAYS = 365;
const MIN_BUILT_DOLLARS = 10_000;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysHeld(purchaseDate: Date, nowMs: number): number {
  return Math.floor((nowMs - purchaseDate.getTime()) / MS_PER_DAY);
}

function singleGenerate(ctx: InsightsContext, nowMs: number): Insight[] {
  const property = ctx.properties[0];
  const metrics = ctx.metrics[0];
  if (!property || !metrics) return [];

  if (daysHeld(property.purchaseDate, nowMs) < MIN_HOLD_DAYS) return [];

  // We compute equity built off of cashInvested when present (the most
  // accurate baseline), or fall back to (currentEquity − implied down payment)
  // when missing. Implementation: if cashInvested missing, equity_built is
  // just the current equity itself (since purchase, the cash they put in IS
  // their initial equity, so equity_built = current_equity − initial_equity ≈
  // current_equity − cashInvested). When cashInvested is null we just report
  // current_equity as the bare figure.
  const equity = metrics.equity;
  const cashInvested = property.cashInvested;

  let equityBuilt: number;
  let multiplier: number | null;

  if (cashInvested != null && cashInvested > 0) {
    equityBuilt = equity - cashInvested;
    multiplier = equity / cashInvested;
  } else {
    equityBuilt = equity;
    multiplier = null;
  }

  if (equityBuilt < MIN_BUILT_DOLLARS) return [];

  const copy = equityBuiltCopy.single({
    equityBuilt,
    cashInvested,
    multiplier,
  });

  return [
    {
      type: TYPE,
      severity: "positive",
      eyebrow: copy.eyebrow,
      value: copy.value,
      explanation: copy.explanation,
      dismissKey: `${TYPE}:${property.id}`,
      dismissThreshold: { metric: "equityBuilt", value: equityBuilt, deltaPct: 15 },
      score: equityBuilt,
    },
  ];
}

function multiGenerate(ctx: InsightsContext, nowMs: number): Insight[] {
  // Sum across properties that meet the hold-time gate.
  let totalEquity = 0;
  let totalCashInvested = 0;
  let cashInvestedKnownForAll = true;
  let propertiesIncluded = 0;

  for (const property of ctx.properties) {
    if (daysHeld(property.purchaseDate, nowMs) < MIN_HOLD_DAYS) continue;
    const metrics = ctx.metrics.find((m) => m.id === property.id);
    if (!metrics) continue;

    totalEquity += metrics.equity;
    if (property.cashInvested != null && property.cashInvested > 0) {
      totalCashInvested += property.cashInvested;
    } else {
      cashInvestedKnownForAll = false;
    }
    propertiesIncluded += 1;
  }

  if (propertiesIncluded === 0) return [];

  let equityBuilt: number;
  let multiplier: number | null;
  let cashInvestedForCopy: number | null;

  if (cashInvestedKnownForAll && totalCashInvested > 0) {
    equityBuilt = totalEquity - totalCashInvested;
    multiplier = totalEquity / totalCashInvested;
    cashInvestedForCopy = totalCashInvested;
  } else {
    // Fall back to bare-dollar framing if any property is missing cashInvested.
    equityBuilt = totalEquity;
    multiplier = null;
    cashInvestedForCopy = null;
  }

  if (equityBuilt < MIN_BUILT_DOLLARS) return [];

  const copy = equityBuiltCopy.multi({
    equityBuilt,
    cashInvested: cashInvestedForCopy,
    multiplier,
  });

  return [
    {
      type: TYPE,
      severity: "positive",
      eyebrow: copy.eyebrow,
      value: copy.value,
      explanation: copy.explanation,
      dismissKey: `${TYPE}:portfolio`,
      dismissThreshold: { metric: "equityBuilt", value: equityBuilt, deltaPct: 15 },
      score: equityBuilt,
    },
  ];
}

/** Internal — exported so tests can inject a deterministic clock. */
export function generateWithClock(ctx: InsightsContext, nowMs: number): Insight[] {
  return ctx.mode === "single"
    ? singleGenerate(ctx, nowMs)
    : multiGenerate(ctx, nowMs);
}

export const equityBuiltGenerator: Generator = {
  type: TYPE,
  appliesTo: ["single", "multi"] as const,
  generate(ctx: InsightsContext): Insight[] {
    return generateWithClock(ctx, Date.now());
  },
};

