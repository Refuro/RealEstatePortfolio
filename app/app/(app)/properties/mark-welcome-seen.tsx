"use client";

import { useEffect } from "react";

export function MarkWelcomeSeen() {
  useEffect(() => {
    void fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_welcome_seen" }),
    });
  }, []);

  return null;
}
