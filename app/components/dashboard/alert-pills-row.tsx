"use client";

export type AlertPillVariant = "neg" | "warn" | "ok";

export type AlertPill = {
  label: string;
  variant: AlertPillVariant;
  onClick?: () => void;
  filterKey?: string;
};

type AlertPillsRowProps = {
  sectionLabel?: string;
  pills: AlertPill[];
};

const PILL_STYLES: Record<AlertPillVariant, React.CSSProperties> = {
  neg: {
    background: "var(--negative-dim)",
    color: "var(--negative)",
    border: "1px solid rgba(248,113,113,0.2)",
  },
  warn: {
    background: "var(--warning-dim)",
    color: "var(--warning)",
    border: "1px solid rgba(251,191,36,0.18)",
  },
  ok: {
    background: "var(--positive-dim)",
    color: "var(--positive)",
    border: "1px solid rgba(52,211,153,0.18)",
  },
};

export function AlertPillsRow({ sectionLabel, pills }: AlertPillsRowProps) {
  if (pills.length === 0) return null;

  return (
    <div>
      {sectionLabel && (
        <div
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--foreground)",
            marginBottom: "10px",
          }}
        >
          {sectionLabel}
        </div>
      )}
      <div className="flex gap-2 flex-wrap overflow-x-auto">
        {pills.map((pill, i) => (
          <button
            key={i}
            onClick={pill.onClick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "7px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: pill.onClick ? "pointer" : "default",
              transition: "opacity 0.15s",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              flexShrink: 0,
              ...PILL_STYLES[pill.variant],
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "currentColor",
                flexShrink: 0,
                display: "inline-block",
              }}
            />
            {pill.label}
          </button>
        ))}
      </div>
    </div>
  );
}
