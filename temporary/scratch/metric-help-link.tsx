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
        className="text-sm text-muted underline hover:text-foreground"
      >
        What do these mean?
      </button>
      <MetricHelpModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
