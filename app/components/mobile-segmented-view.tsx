"use client";

import { useState } from "react";

type MobileSegmentedItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type MobileSegmentedViewProps = {
  items: MobileSegmentedItem[];
  initialItemId?: string;
};

export function MobileSegmentedView({
  items,
  initialItemId,
}: MobileSegmentedViewProps) {
  const defaultItemId = initialItemId ?? items[0]?.id ?? "";
  const [activeItemId, setActiveItemId] = useState(defaultItemId);
  const activeItem =
    items.find((item) => item.id === activeItemId) ?? items[0] ?? null;

  if (!activeItem) return null;

  return (
    <div className="space-y-3 md:hidden">
      <div className="grid grid-cols-3 gap-2 rounded-lg border border-border/70 bg-card p-1">
        {items.map((item) => {
          const active = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveItemId(item.id)}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:bg-subtle hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div>{activeItem.content}</div>
    </div>
  );
}
