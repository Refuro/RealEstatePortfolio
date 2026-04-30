"use client";

import { useState } from "react";
import { MetricHelpModal } from "@/components/metric-help-modal";

export function MetricHelpLink() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[12px] text-muted underline hover:text-foreground"
      >
        What do these terms mean?
      </button>
      <MetricHelpModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
