/**
 * Tests that lock down the Phase 2 copy strings.
 * Generator tests verify behavior (when does an insight fire, what's the score);
 * these tests verify prose (does the copy read correctly with various inputs).
 */

import { describe, expect, it } from "vitest";
import {
  cashFlowDragCopy,
  rentOpportunityCopy,
  refiGapCopy,
  totalReturnCopy,
  bestPerformerCopy,
  ltvRiskCopy,
  equityBuiltCopy,
} from "./copy";

// ─── cash_flow_drag ──────────────────────────────────────────────────────────

describe("cashFlowDragCopy.single", () => {
  it("produces direct framing with monthly + annual numbers", () => {
    const out = cashFlowDragCopy.single({ monthlyDrag: 708, annualDrag: 8496 });
    expect(out.eyebrow).toBe("Cash flow drag");
    expect(out.value).toBe("−$708 / mo");
    expect(out.explanation).toContain("$708/mo");
    expect(out.explanation).toContain("$8,496/yr");
    expect(out.explanation).not.toContain("PHASE 2");
  });
});

describe("cashFlowDragCopy.multi", () => {
  it("matches the 20-prop mockup pattern: count + cost + worst-2 + offset", () => {
    const out = cashFlowDragCopy.multi({
      count: 7,
      totalProperties: 20,
      totalMonthlyDrag: 2174,
      totalAnnualDrag: 26088,
      worstNames: ["South Austin", "4821 Maple"],
      worstAmounts: [408, 708],
      healthyCount: 13,
      healthyMonthlyTotal: 7823,
    });
    expect(out.eyebrow).toBe("Cash flow drag");
    expect(out.value).toBe("−$2,174 / mo");
    expect(out.explanation).toContain("7 properties are cash flow negative");
    expect(out.explanation).toContain("$26,088/yr");
    expect(out.explanation).toContain("South Austin");
    expect(out.explanation).toContain("4821 Maple");
    expect(out.explanation).toContain("biggest drags");
    expect(out.explanation).toContain("Your other 13 produce");
    expect(out.explanation).toContain("$7,823/mo");
  });

  it("uses solo-healthy framing when only one property is positive", () => {
    const out = cashFlowDragCopy.multi({
      count: 1,
      totalProperties: 2,
      totalMonthlyDrag: 500,
      totalAnnualDrag: 6000,
      worstNames: ["Maple Ave"],
      worstAmounts: [500],
      healthyCount: 1,
      healthyMonthlyTotal: 1200,
      soloHealthyName: "Oak St",
    });
    expect(out.explanation).toContain("Maple Ave");
    expect(out.explanation).toContain("1 property is cash flow negative");
    expect(out.explanation).toContain("Oak St offsets with +$1,200/mo");
  });

  it("uses 'all' framing when every property is negative", () => {
    const out = cashFlowDragCopy.multi({
      count: 3,
      totalProperties: 3,
      totalMonthlyDrag: 1500,
      totalAnnualDrag: 18000,
      worstNames: ["A", "B"],
      worstAmounts: [800, 500],
      healthyCount: 0,
      healthyMonthlyTotal: 0,
    });
    expect(out.explanation).toContain("All 3");
    expect(out.explanation).not.toContain("Your other");
  });
});

// ─── rent_opportunity ────────────────────────────────────────────────────────

describe("rentOpportunityCopy.single", () => {
  it("frames percentage gap with dollar consequence", () => {
    const out = rentOpportunityCopy.single({
      pctBelow: 12,
      monthlyGap: 180,
      annualGap: 2160,
    });
    expect(out.value).toBe("~$180 / mo");
    expect(out.explanation).toContain("12.0% below market");
    expect(out.explanation).toContain("$180/mo");
    expect(out.explanation).toContain("$2,160/yr");
  });
});

describe("rentOpportunityCopy.multi", () => {
  it("lists named properties with their gap percentages", () => {
    const out = rentOpportunityCopy.multi({
      count: 4,
      totalMonthlyGap: 820,
      worstNames: ["South Austin", "Uptown Dallas", "Germantown", "Buckhead"],
      worstPcts: [30.2, 26.2, 12, 5],
    });
    expect(out.value).toBe("~$820 / mo");
    expect(out.explanation).toContain("4 properties are below market");
    expect(out.explanation).toContain("South Austin (30.2%)");
    expect(out.explanation).toContain("Uptown Dallas (26.2%)");
    expect(out.explanation).toContain("~$820/mo");
    expect(out.cta?.label).toBe("View underperforming →");
  });
});

// ─── refi_gap ────────────────────────────────────────────────────────────────

describe("refiGapCopy.single", () => {
  it("uses 'competitive refi terms' language, NOT 'minimum lenders require'", () => {
    const out = refiGapCopy.single({
      rentIncreaseNeeded: 680,
      currentDscr: 1.10,
      belowAccessMinimum: false,
    });
    expect(out.explanation).toContain("competitive refi terms");
    expect(out.explanation).not.toContain("minimum most lenders require");
    expect(out.explanation).not.toContain("the minimum");
    expect(out.value).toBe("+$680 / mo");
  });

  it("uses urgent framing when below DSCR 1.0 access minimum", () => {
    const out = refiGapCopy.single({
      rentIncreaseNeeded: 1200,
      currentDscr: 0.85,
      belowAccessMinimum: true,
    });
    expect(out.explanation).toContain("below the 1.0 access minimum");
    expect(out.explanation).toContain("0.85");
  });

  it("uses opportunity framing when DSCR is between 1.0 and 1.25", () => {
    const out = refiGapCopy.single({
      rentIncreaseNeeded: 200,
      currentDscr: 1.18,
      belowAccessMinimum: false,
    });
    expect(out.explanation).not.toContain("below the 1.0 access minimum");
    expect(out.explanation).toContain("DSCR 1.25");
  });

  it("provides a CTA to the modeling page", () => {
    const out = refiGapCopy.single({
      rentIncreaseNeeded: 500,
      currentDscr: 1.10,
      belowAccessMinimum: false,
    });
    expect(out.cta?.href).toBe("/modeling");
  });
});

// ─── total_return ────────────────────────────────────────────────────────────

describe("totalReturnCopy", () => {
  it("reframes negative cash flow via appreciation + paydown (single)", () => {
    const out = totalReturnCopy.single({
      annualTotalReturn: 13504,
      annualCashFlow: -8496,
      annualAppreciation: 22000,
      annualPaydown: 8000,
      pctOfEquity: 0.039,
    });
    expect(out.value).toBe("+$13,504 / yr");
    expect(out.explanation).toContain("cash flow −$8,496 / yr");
    expect(out.explanation).toContain("$22,000 appreciation");
    expect(out.explanation).toContain("$8,000 mortgage paydown");
    expect(out.explanation).toContain("+$13,504 / yr total return");
    expect(out.explanation).toContain("3.9% on equity");
    // The conjunction "but" is the heart of the reframe.
    expect(out.explanation).toContain("but");
  });

  it("uses positive-lead framing when CF is positive (single)", () => {
    const out = totalReturnCopy.single({
      annualTotalReturn: 25000,
      annualCashFlow: 5000,
      annualAppreciation: 15000,
      annualPaydown: 5000,
      pctOfEquity: 0.05,
    });
    expect(out.explanation).toContain("cash flow +$5,000 / yr");
    expect(out.explanation).not.toContain("but");
    expect(out.explanation).toContain("with");
  });

  it("uses portfolio-scoped subject in multi mode", () => {
    const out = totalReturnCopy.multi({
      annualTotalReturn: 50000,
      annualCashFlow: -10000,
      annualAppreciation: 40000,
      annualPaydown: 20000,
      pctOfEquity: 0.04,
    });
    expect(out.explanation).toContain("Your portfolio's");
  });

  it("omits the percentage suffix when pctOfEquity is null", () => {
    const out = totalReturnCopy.single({
      annualTotalReturn: 5000,
      annualCashFlow: -1000,
      annualAppreciation: 4000,
      annualPaydown: 2000,
      pctOfEquity: null,
    });
    expect(out.explanation).not.toContain("on equity");
  });
});

// ─── best_performer ──────────────────────────────────────────────────────────

describe("bestPerformerCopy.multi", () => {
  it("matches the 20-prop mockup pattern: named list + combined CF + share %", () => {
    const out = bestPerformerCopy.multi({
      topNames: ["Oak Street", "Scottsdale", "Fort Worth"],
      topCapRates: [0.072, 0.065, 0.068],
      topMonthlyCashFlows: [1240, 1100, 1180],
      combinedMonthlyCashFlow: 3520,
      shareOfPortfolioCfPct: 62,
    });
    expect(out.value).toBe("3 properties");
    expect(out.explanation).toContain("Oak Street (7.2% cap, +$1,240 / mo)");
    expect(out.explanation).toContain("Scottsdale (6.5% cap, +$1,100 / mo)");
    expect(out.explanation).toContain("Fort Worth (6.8% cap, +$1,180 / mo)");
    expect(out.explanation).toContain("$3,520/mo");
    expect(out.explanation).toContain("62% of your total cash flow");
  });

  it("uses singular verb for one performer", () => {
    const out = bestPerformerCopy.multi({
      topNames: ["Oak Street"],
      topCapRates: [0.072],
      topMonthlyCashFlows: [1240],
      combinedMonthlyCashFlow: 1240,
      shareOfPortfolioCfPct: 35,
    });
    expect(out.value).toBe("1 property");
    expect(out.explanation).toContain("generates");
    expect(out.explanation).not.toContain(" generate ");
  });
});

// ─── ltv_risk ────────────────────────────────────────────────────────────────

describe("ltvRiskCopy.single", () => {
  it("uses warning framing for 80–90% LTV", () => {
    const out = ltvRiskCopy.single({ ltvPct: 87.5, severityLabel: "warning" });
    expect(out.value).toBe("87.5%");
    expect(out.explanation).toContain("80% line");
    expect(out.explanation).not.toContain("refi-locked");
  });

  it("uses refi-locked framing for >90% LTV", () => {
    const out = ltvRiskCopy.single({ ltvPct: 92, severityLabel: "negative" });
    expect(out.explanation).toContain("refi-locked");
  });
});

describe("ltvRiskCopy.multi", () => {
  it("lists worst properties with LTV percentages", () => {
    const out = ltvRiskCopy.multi({
      count: 3,
      worstNames: ["A", "B", "C"],
      worstLtvPcts: [92, 87, 81],
      severityLabel: "negative",
    });
    expect(out.value).toBe("3 properties");
    expect(out.explanation).toContain("3 properties are");
    expect(out.explanation).toContain("A (92.0%)");
    expect(out.explanation).toContain("B (87.0%)");
    expect(out.explanation).toContain("C (81.0%)");
    expect(out.explanation).toContain("refi-locked");
  });
});

// ─── equity_built ────────────────────────────────────────────────────────────

describe("equityBuiltCopy.single", () => {
  it("includes the multiplier when cashInvested is present", () => {
    const out = equityBuiltCopy.single({
      equityBuilt: 87000,
      cashInvested: 32000,
      multiplier: 2.71875,
    });
    expect(out.value).toBe("+$87,000");
    expect(out.explanation).toContain("$87,000");
    expect(out.explanation).toContain("$32,000");
    expect(out.explanation).toContain("2.7× return");
  });

  it("drops the multiplier when cashInvested is missing", () => {
    const out = equityBuiltCopy.single({
      equityBuilt: 200000,
      cashInvested: null,
      multiplier: null,
    });
    expect(out.explanation).toContain("$200,000");
    expect(out.explanation).not.toContain("×");
    expect(out.explanation).toContain("since purchase");
  });
});

describe("equityBuiltCopy.multi", () => {
  it("uses portfolio framing with multiplier", () => {
    const out = equityBuiltCopy.multi({
      equityBuilt: 345000,
      cashInvested: 98000,
      multiplier: 4.51,
    });
    expect(out.explanation).toContain("Your portfolio");
    expect(out.explanation).toContain("$345,000");
    expect(out.explanation).toContain("$98,000");
    expect(out.explanation).toContain("4.5× return");
  });
});
