"use client";

/**
 * Dynamically-loaded calculator wrappers for marketing/tool pages.
 * Each export is a lazily-imported client component so the calculator JS
 * is split into its own chunk and excluded from the page's initial bundle.
 * Also imported by calculator-location-slot.tsx for the location page dispatcher.
 */

import dynamic from "next/dynamic";

const loadingEl = () => (
  <div className="h-64 animate-pulse rounded-xl bg-subtle" aria-busy="true" />
);

export const BrrrSlot = dynamic(
  () => import("./brrr-calculator").then((m) => ({ default: m.BrrrCalculator })),
  { ssr: false, loading: loadingEl }
);

export const StrLtrSlot = dynamic(
  () => import("./str-ltr-calculator").then((m) => ({ default: m.StrLtrCalculator })),
  { ssr: false, loading: loadingEl }
);

export const FixAndFlipSlot = dynamic(
  () => import("./fix-and-flip-calculator").then((m) => ({ default: m.FixAndFlipCalculator })),
  { ssr: false, loading: loadingEl }
);

export const CapRateSlot = dynamic(
  () => import("./cap-rate-calculator").then((m) => ({ default: m.CapRateCalculator })),
  { ssr: false, loading: loadingEl }
);

export const CashOnCashSlot = dynamic(
  () => import("./cash-on-cash-calculator").then((m) => ({ default: m.CashOnCashCalculator })),
  { ssr: false, loading: loadingEl }
);

export const DscrSlot = dynamic(
  () => import("./dscr-calculator").then((m) => ({ default: m.DscrCalculator })),
  { ssr: false, loading: loadingEl }
);

export const WholesaleSlot = dynamic(
  () => import("./wholesale-calculator").then((m) => ({ default: m.WholesaleCalculator })),
  { ssr: false, loading: loadingEl }
);

export const RentVsBuySlot = dynamic(
  () => import("./rent-vs-buy-calculator").then((m) => ({ default: m.RentVsBuyCalculator })),
  { ssr: false, loading: loadingEl }
);

export const PublicCalculatorSlot = dynamic(
  () => import("./public-calculator").then((m) => ({ default: m.PublicCalculator })),
  { ssr: false, loading: loadingEl }
);
