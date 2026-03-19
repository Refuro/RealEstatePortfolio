"use client";

import { LocalDate } from "@/components/local-date";

type SubscriptionBillingDisplayProps = {
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean | null;
};

export function SubscriptionBillingDisplay({
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: SubscriptionBillingDisplayProps) {
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
