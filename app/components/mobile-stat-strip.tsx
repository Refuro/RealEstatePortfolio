type MobileStatItem = {
  label: string;
  value: string;
  tone?: "default" | "positive" | "warning" | "negative";
  helper?: string;
};

type MobileStatStripProps = {
  items: MobileStatItem[];
  columns?: 2 | 3;
};

const toneClass: Record<NonNullable<MobileStatItem["tone"]>, string> = {
  default: "text-foreground",
  positive: "text-positive",
  warning: "text-warning",
  negative: "text-negative",
};

export function MobileStatStrip({ items, columns = 2 }: MobileStatStripProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl bg-card p-3">
      <div className={`grid gap-x-4 gap-y-3 ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`}>
            <p className="text-[11px] font-medium text-muted">{item.label}</p>
            <p
              className={`mt-0.5 text-base font-semibold tabular-nums ${toneClass[item.tone ?? "default"]}`}
            >
              {item.value}
            </p>
            {item.helper ? <p className="mt-0.5 text-[11px] text-muted">{item.helper}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export type { MobileStatItem, MobileStatStripProps };
