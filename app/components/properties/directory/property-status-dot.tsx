import type { PropertyStatus } from "@/lib/property-status";

const COLOR: Record<PropertyStatus, string> = {
  negative: "var(--negative)",
  warning: "var(--warning)",
  positive: "var(--positive)",
};

const LABEL: Record<PropertyStatus, string> = {
  negative: "Needs attention",
  warning: "Profile incomplete or rent below market",
  positive: "Healthy",
};

export function PropertyStatusDot({
  status,
  className = "",
}: {
  status: PropertyStatus;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={LABEL[status]}
      title={LABEL[status]}
      className={`inline-block size-2 shrink-0 rounded-full ${className}`}
      style={{ background: COLOR[status] }}
    />
  );
}
