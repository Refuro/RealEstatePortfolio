"use client";

import { useMemo, useState } from "react";
import { MobileModeSwitcher } from "@/components/mobile-mode-switcher";
import {
  MobileStatStrip,
  type MobileStatItem,
} from "@/components/mobile-stat-strip";

type MobileToolShellMode = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type MobileToolShellProps = {
  contextBar?: React.ReactNode;
  title?: string;
  description?: string;
  eyebrow?: string;
  context?: React.ReactNode;
  summaryItems?: MobileStatItem[];
  summaryColumns?: 2 | 3;
  modes?: MobileToolShellMode[];
  initialModeId?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  contentClassName?: string;
};

export function MobileToolShell({
  contextBar,
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
    () =>
      modes.find((mode) => mode.id === activeModeId) ??
      (initialModeId ? modes.find((mode) => mode.id === initialModeId) : undefined) ??
      modes[0] ??
      null,
    [activeModeId, initialModeId, modes]
  );
  const useModes = modes.length > 0 && !children;

  if (useModes && !activeMode) return null;

  return (
    <div className="pb-6 md:hidden">
      {contextBar ? (
        <div className="border-b border-border">{contextBar}</div>
      ) : (
        <div className="border-b border-border px-4 py-3">
          <div>
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h2 className="mt-1 text-xl font-semibold text-foreground">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
          {context}
        </div>
      )}
      {summaryItems.length > 0 ? (
        <div className="px-4 pt-3">
          <MobileStatStrip items={summaryItems} columns={summaryColumns} />
        </div>
      ) : null}
      {useModes ? (
        <div className="px-4 pt-3">
          <MobileModeSwitcher
            items={modes.map(({ id, label }) => ({ id, label }))}
            activeItemId={activeMode.id}
            onChange={setActiveModeId}
          />
        </div>
      ) : null}
      <div className={`px-4 pt-4 ${contentClassName}`.trim()}>
        {useModes ? activeMode.content : children}
      </div>
      {footer ? (
        <div className="border-t border-border px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export type { MobileToolShellMode };
