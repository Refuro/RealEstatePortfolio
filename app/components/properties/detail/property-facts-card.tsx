"use client";

import { formatCurrency } from "@/lib/format-currency";
import { formatPropertyType } from "@/lib/property-utils";
import { useIsMobile } from "@/lib/use-is-mobile";

export type PropertyFactsCardProps = {
  nickname: string | null;
  address: string;
  propertyType: string;
  units: number;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  purchaseDate: Date | string;
  purchasePrice: number;
  /** Opens the drawer at the property-facts section. */
  onEdit: () => void;
};

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatBedBath(
  bedrooms: number | null,
  bathrooms: number | null
): string | null {
  if (bedrooms == null && bathrooms == null) return null;
  const bd = bedrooms != null ? `${bedrooms} bd` : "—";
  const ba = bathrooms != null ? `${bathrooms} ba` : "—";
  return `${bd} / ${ba}`;
}

export function PropertyFactsCard({
  nickname,
  address,
  propertyType,
  units,
  bedrooms,
  bathrooms,
  squareFeet,
  purchaseDate,
  purchasePrice,
  onEdit,
}: PropertyFactsCardProps) {
  const isMobile = useIsMobile();
  const bedBath = formatBedBath(bedrooms, bathrooms);

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5 md:py-4">
        <h2 className="text-base font-semibold text-foreground">Property facts</h2>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          Edit
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4 sm:gap-x-6 sm:gap-y-4 sm:py-5">
        {/* Mobile drops nickname + address: both already render in the hero. */}
        {!isMobile && nickname && <Cell label="Nickname" value={nickname} />}
        {!isMobile && <Cell label="Address" value={address || "—"} />}
        <Cell label="Property type" value={formatPropertyType(propertyType, units)} />
        <Cell label="Purchase date" value={formatDate(purchaseDate)} />
        <Cell label="Purchase price" value={formatCurrency(purchasePrice)} />
        <Cell label="Beds / Baths" value={bedBath} placeholder="—" />
        {(!isMobile || squareFeet != null) && (
          <Cell
            label="Square footage"
            value={squareFeet != null ? `${squareFeet.toLocaleString()} sqft` : null}
            placeholder="Not set"
          />
        )}
      </dl>
    </section>
  );
}

function Cell({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string | null;
  placeholder?: string;
}) {
  const isEmpty = value == null || value === "—";
  return (
    <div>
      <dt className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-muted">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm tabular-nums ${
          isEmpty ? "italic text-muted" : "font-medium text-foreground"
        }`}
      >
        {isEmpty ? placeholder ?? "—" : value}
      </dd>
    </div>
  );
}
