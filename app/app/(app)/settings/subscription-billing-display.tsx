"use client";

import { useEffect, useState } from "react";
import { LocalDate } from "@/components/local-date";

type SubscriptionBillingDisplayProps = {
  initialCurrentPeriodEnd: string;
  initialCancelAtPeriodEnd: boolean | null;
};

export function SubscriptionBillingDisplay({
  initialCurrentPeriodEnd,
  initialCancelAtPeriodEnd,
}: SubscriptionBillingDisplayProps) {
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState(initialCurrentPeriodEnd);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(initialCancelAtPeriodEnd);

  useEffect(() => {
    if (!initialCurrentPeriodEnd) return;

    fetch("/api/billing/subscription-details")
      .then((res) => res.json())
      .then((data: { currentPeriodEnd?: string | null; cancelAtPeriodEnd?: boolean | null }) => {
        if (data.currentPeriodEnd != null) setCurrentPeriodEnd(data.currentPeriodEnd);
        if (data.cancelAtPeriodEnd !== undefined) setCancelAtPeriodEnd(data.cancelAtPeriodEnd ?? null);
      })
      .catch(() => {
        // Keep initial values on fetch failure
      });
  }, [initialCurrentPeriodEnd]);

  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
      <dt className="text-sm font-medium text-muted">
        {cancelAtPeriodEnd ? "Plan ends" : "Next billing"}
      </dt>
      <dd className="text-base text-foreground">
        <LocalDate value={currentPeriodEnd} />
        {cancelAtPeriodEnd && (
          <span className="ml-1 text-muted">
            — You will have full access up until the expiration date
          </span>
        )}
      </dd>
    </div>
  );
}
