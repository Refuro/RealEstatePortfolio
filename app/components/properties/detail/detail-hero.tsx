import type { ReactNode } from "react";
import { formatPropertyType } from "@/lib/property-utils";
import { PropertyStatusDot } from "@/components/properties/directory/property-status-dot";
import type { PropertyStatus } from "@/lib/property-status";
import { OwnershipChip } from "@/components/ownership/ownership-chip";

export type DetailHeroProps = {
  name: string;
  address: string;
  propertyType: string;
  units: number;
  status: PropertyStatus;
  ownershipPercent: number;
  onEditOwnership?: () => void;
  /**
   * Optional action slot rendered inline with the title (mobile use-case:
   * overflow menu). Keep this small — visually pairs with the title.
   */
  actions?: ReactNode;
};

export function DetailHero({
  name,
  address,
  propertyType,
  units,
  status,
  ownershipPercent,
  onEditOwnership,
  actions,
}: DetailHeroProps) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <PropertyStatusDot status={status} className="size-2.5" />
        <h1 className="min-w-0 flex-1 truncate text-2xl font-semibold text-foreground">
          {name}
        </h1>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {address && <p className="mt-1 text-sm text-muted">{address}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-border bg-subtle/30 px-2 py-0.5 text-xs font-medium text-muted">
          {formatPropertyType(propertyType, units)}
        </span>
        <OwnershipChip ownershipPercent={ownershipPercent} onClick={onEditOwnership} />
      </div>
      {ownershipPercent < 100 && (
        <p className="mt-1.5 text-xs text-muted">
          Cash flow, equity, NOI, and rent reflect your {ownershipPercent}% share. Property value, cap rate, LTV, and DSCR are property-level.
        </p>
      )}
    </div>
  );
}
