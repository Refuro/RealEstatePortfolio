import { describe, expect, it } from "vitest";
import {
  getCashOnCashTone,
  getDscrTone,
  getMonthlyCashFlowTone,
} from "./calculator-metric-tones";

describe("getDscrTone", () => {
  it("returns default for null", () => {
    expect(getDscrTone(null)).toBe("default");
  });

  it("returns positive at and above 1.0", () => {
    expect(getDscrTone(1)).toBe("positive");
    expect(getDscrTone(1.3)).toBe("positive");
  });

  it("returns warning in [0.9, 1.0)", () => {
    expect(getDscrTone(0.9)).toBe("warning");
    expect(getDscrTone(0.95)).toBe("warning");
    expect(getDscrTone(0.999)).toBe("warning");
  });

  it("returns negative below 0.9", () => {
    expect(getDscrTone(0.89)).toBe("negative");
    expect(getDscrTone(0)).toBe("negative");
  });
});

describe("getMonthlyCashFlowTone", () => {
  it("returns positive for zero and above", () => {
    expect(getMonthlyCashFlowTone(0)).toBe("positive");
    expect(getMonthlyCashFlowTone(100)).toBe("positive");
  });

  it("returns negative when negative", () => {
    expect(getMonthlyCashFlowTone(-0.01)).toBe("negative");
  });
});

describe("getCashOnCashTone", () => {
  it("returns default for null", () => {
    expect(getCashOnCashTone(null)).toBe("default");
  });

  it("returns positive for zero and above", () => {
    expect(getCashOnCashTone(0)).toBe("positive");
    expect(getCashOnCashTone(0.12)).toBe("positive");
  });

  it("returns negative when negative", () => {
    expect(getCashOnCashTone(-0.05)).toBe("negative");
  });
});
