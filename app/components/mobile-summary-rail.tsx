type MobileSummaryItem = {
  label: string;
  value: string;
  tone?: "default" | "positive" | "warning" | "negative";
  helper?: string;
};

type MobileSummaryRailProps = {
  items: MobileSummaryItem[];
  columns?: 2 | 3;
};

const toneClass: Record<NonNullable<MobileSummaryItem["tone"]>, string> = {
  default: "text-foreground",
  positive: "text-positive",
  warning: "text-warning",
  negative: "text-negative",
};

export function MobileSummaryRail({
  items,
  columns = 2,
}: MobileSummaryRailProps) {
  if (items.length === 0) return null;

  return (
    <div className={`grid gap-2 ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="rounded-2xl border border-border/70 bg-background/75 px-3 py-2.5"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {item.label}
          </p>
          <p className={`mt-1 text-base font-semibold ${toneClass[item.tone ?? "default"]}`}>
            {item.value}
          </p>
          {item.helper ? <p className="mt-0.5 text-[11px] text-muted">{item.helper}</p> : null}
        </div>
      ))}
    </div>
  );
}

export type { MobileSummaryItem };
