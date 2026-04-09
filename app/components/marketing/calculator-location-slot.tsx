"use client";

import type { CalculatorLocationSlug } from "@/lib/marketing/calculator-location-pages";
import {
  BrrrSlot,
  CapRateSlot,
  CashOnCashSlot,
  DscrSlot,
  FixAndFlipSlot,
  PublicCalculatorSlot,
  RentVsBuySlot,
  StrLtrSlot,
  WholesaleSlot,
} from "./calculator-page-slots";

export function CalculatorLocationSlot({
  calculator,
  landingVariant,
  avgMonthlyRent,
  medianHomePrice,
}: {
  calculator: CalculatorLocationSlug;
  landingVariant: string;
  avgMonthlyRent?: number | null;
  medianHomePrice?: number | null;
}) {
  const monthlyRent = avgMonthlyRent ?? undefined;
  const homePrice = medianHomePrice ?? undefined;

  switch (calculator) {
    case "brrr":
      return (
        <BrrrSlot showCta landingVariant={landingVariant} initialMonthlyRent={monthlyRent} />
      );
    case "str-vs-ltr":
      return (
        <StrLtrSlot showCta landingVariant={landingVariant} initialLtrRent={monthlyRent} />
      );
    case "fix-and-flip":
      return (
        <FixAndFlipSlot
          showCta
          landingVariant={landingVariant}
          initialPurchasePrice={homePrice}
        />
      );
    case "investment-property":
      return (
        <PublicCalculatorSlot
          showCta
          landingVariant={landingVariant}
          initialMonthlyRent={monthlyRent}
          funnelPlacement="investment_property_location_inline"
        />
      );
    case "cap-rate":
      return (
        <CapRateSlot
          showCta
          landingVariant={landingVariant}
          initialPurchasePrice={homePrice}
          initialMonthlyRent={monthlyRent}
        />
      );
    case "cash-on-cash":
      return (
        <CashOnCashSlot
          showCta
          landingVariant={landingVariant}
          initialMonthlyRent={monthlyRent}
          initialCashInvested={homePrice != null ? homePrice * 0.2 : undefined}
        />
      );
    case "dscr":
      return (
        <DscrSlot
          showCta
          landingVariant={landingVariant}
          initialMonthlyRent={monthlyRent}
          initialLoanAmount={homePrice != null ? homePrice * 0.8 : undefined}
        />
      );
    case "wholesale":
      return (
        <WholesaleSlot showCta landingVariant={landingVariant} initialArv={homePrice} />
      );
    case "rent-vs-buy":
      return (
        <RentVsBuySlot
          showCta
          landingVariant={landingVariant}
          initialHomePrice={homePrice}
        />
      );
    default:
      return null;
  }
}
