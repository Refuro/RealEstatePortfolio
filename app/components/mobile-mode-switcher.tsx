"use client";

type MobileModeSwitcherItem = {
  id: string;
  label: string;
};

type MobileModeSwitcherProps = {
  items: MobileModeSwitcherItem[];
  activeItemId: string;
  onChange: (itemId: string) => void;
};

export function MobileModeSwitcher({
  items,
  activeItemId,
  onChange,
}: MobileModeSwitcherProps) {
  const columnClass =
    items.length <= 2 ? "grid-cols-2" : items.length === 3 ? "grid-cols-3" : "grid-cols-4";

  return (
    <div className={`grid gap-2 rounded-2xl bg-background/70 p-1 ${columnClass}`}>
      {items.map((item) => {
        const active = item.id === activeItemId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted hover:bg-card hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
