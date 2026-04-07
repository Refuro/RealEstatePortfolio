"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type AdminTab = {
  id: string;
  label: string;
  content: ReactNode;
};

export function AdminTabs({ tabs }: { tabs: AdminTab[] }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "overview");

  return (
    <div className="mt-6">
      <div className="overflow-x-auto border-b border-border">
        <div className="flex min-w-max items-center gap-1">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex min-h-[44px] items-center border-b-2 px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
                aria-selected={isActive}
                role="tab"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6" role="tabpanel">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
