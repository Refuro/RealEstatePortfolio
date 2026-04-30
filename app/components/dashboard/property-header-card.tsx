import type { ReactNode } from "react";

export type PropertyTagVariant = "neutral" | "warn" | "pos" | "neg";

export type PropertyTag = {
  label: string;
  variant: PropertyTagVariant;
};

const TAG_STYLES: Record<PropertyTagVariant, React.CSSProperties> = {
  neutral: {
    background: "rgba(255,255,255,0.06)",
    color: "var(--foreground-muted)",
    border: "1px solid var(--border)",
  },
  warn: {
    background: "var(--warning-dim)",
    color: "var(--warning)",
    border: "1px solid rgba(251,191,36,0.2)",
  },
  pos: {
    background: "var(--positive-dim)",
    color: "var(--positive)",
    border: "1px solid rgba(52,211,153,0.2)",
  },
  neg: {
    background: "var(--negative-dim)",
    color: "var(--negative)",
    border: "1px solid rgba(248,113,113,0.2)",
  },
};

type PropertyHeaderCardProps = {
  address: string;
  location: string;
  tags?: PropertyTag[];
  propertyHref: string;
  /** Flex-grow visualization slot rendered to the right of the meta column */
  centerSlot?: ReactNode;
  /** Slot for signal strip (rendered below the meta section, inside the card border) */
  children?: ReactNode;
};

export function PropertyHeaderCard({
  address,
  location,
  tags = [],
  propertyHref,
  centerSlot,
  children,
}: PropertyHeaderCardProps) {
  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div
        className="px-4 py-4 gap-4 md:px-6 md:py-5 md:gap-12"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0, flex: "0 0 auto" }}>
          <a
            href={propertyHref}
            className="group inline-flex items-center gap-1.5 transition-colors hover:[&_.address-text]:text-accent hover:[&_.address-arrow]:text-accent"
            style={{
              textDecoration: "none",
              color: "var(--foreground)",
            }}
          >
            <span
              className="address-text transition-colors"
              style={{ fontSize: "16px", fontWeight: 600 }}
            >
              {address}
            </span>
            <svg
              className="address-arrow transition-colors"
              width="12"
              height="12"
              viewBox="0 0 11 11"
              fill="none"
              aria-hidden="true"
              style={{ color: "var(--foreground-muted)", flexShrink: 0 }}
            >
              <path
                d="M3 5.5h5M5.5 3l2.5 2.5L5.5 8"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <div style={{ fontSize: "12.5px", color: "var(--foreground-muted)", marginTop: "2px" }}>
            {location}
          </div>

          {tags.length > 0 && (
            <div
              style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}
            >
              {tags.map((tag, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 9px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 500,
                    ...TAG_STYLES[tag.variant],
                  }}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {centerSlot && (
          <div
            style={{
              flex: "1 1 320px",
              minWidth: "280px",
            }}
          >
            {centerSlot}
          </div>
        )}

      </div>

      {children}
    </div>
  );
}
