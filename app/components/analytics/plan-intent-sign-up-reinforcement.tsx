"use client";

import { useSearchParams } from "next/navigation";
import { parseIntentQueryParam } from "@/lib/plan-intent";

/**
 * Reinforcement when sign-up URL includes `?intent=investor` or `?intent=pro`.
 * (Other `plan_intent` sources still apply via `PlanIntentUrlSync` on this route.)
 */
export function PlanIntentSignUpReinforcement() {
  const searchParams = useSearchParams();
  const intent = parseIntentQueryParam(searchParams.get("intent"));
  if (intent !== "investor" && intent !== "pro") return null;

  const label = intent === "pro" ? "Pro" : "Investor";

  return (
    <p className="max-w-md text-center text-sm text-muted">
      You&apos;re creating an account with the <span className="font-medium text-foreground">{label}</span>{" "}
      plan in mind. You&apos;ll start on Free; when you&apos;re ready, open{" "}
      <span className="whitespace-nowrap font-medium text-foreground">Plans &amp; billing</span> to
      subscribe.
    </p>
  );
}
