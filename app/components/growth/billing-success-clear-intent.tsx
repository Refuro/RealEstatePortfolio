"use client";

import { useEffect } from "react";
import { clearPlanIntent } from "@/lib/plan-intent";

/** Clears stored signup funnel intent after a successful subscription so analytics reflects checkout completion. */
export function BillingSuccessClearIntent() {
  useEffect(() => {
    clearPlanIntent();
  }, []);
  return null;
}
