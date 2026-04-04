"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/lib/use-is-mobile";

type MobileCollapsibleProps = {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function MobileCollapsible({
  label,
  children,
  defaultOpen = false,
}: MobileCollapsibleProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(defaultOpen);

  if (!isMobile) return <>{children}</>;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[44px] w-full items-center justify-between rounded-md px-1 py-2 text-left text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground"
      >
        <span>{label}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && children}
    </div>
  );
}
