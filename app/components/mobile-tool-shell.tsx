"use client";

import { useMemo, useState } from "react";
import { MobileModeSwitcher } from "@/components/mobile-mode-switcher";
import {
  MobileSummaryRail,
  type MobileSummaryItem,
} from "@/components/mobile-summary-rail";

type MobileToolShellMode = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type MobileToolShellProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  context?: React.ReactNode;
  summaryItems?: MobileSummaryItem[];
  summaryColumns?: 2 | 3;
  modes?: MobileToolShellMode[];
  initialModeId?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  contentClassName?: string;
};

export function MobileToolShell({
  title,
  description,
  eyebrow,
  context,
  summaryItems = [],
  summaryColumns = 2,
  modes = [],
  initialModeId,
  footer,
  children,
  contentClassName = "",
}: MobileToolShellProps) {
  const defaultModeId = initialModeId ?? modes[0]?.id ?? "";
  const [activeModeId, setActiveModeId] = useState(defaultModeId);

  const activeMode = useMemo(
    () => modes.find((mode) => mode.id === activeModeId) ?? modes[0] ?? null,
    [activeModeId, modes]
  );
  const useModes = modes.length > 0 && !children;

  if (useModes && !activeMode) return null;

  return (
    <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card/95 shadow-sm md:hidden">
      <div className="space-y-4 border-b border-border/70 p-4">
        <div>
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-1 text-xl font-semibold text-foreground">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        </div>
        {context}
        <MobileSummaryRail items={summaryItems} columns={summaryColumns} />
      </div>
      <div className={`p-3 ${contentClassName}`.trim()}>
        {useModes ? (
          <div className="space-y-4">
            <MobileModeSwitcher
              items={modes.map(({ id, label }) => ({ id, label }))}
              activeItemId={activeMode.id}
              onChange={setActiveModeId}
            />
            <div className="px-1 pb-1">{activeMode.content}</div>
          </div>
        ) : (
          <div className="px-1 pb-1">{children}</div>
        )}
      </div>
      {footer ? (
        <div className="border-t border-border/70 px-4 pt-4 pb-6">{footer}</div>
      ) : null}
    </div>
  );
}

export type { MobileToolShellMode };
