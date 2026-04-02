"use client";

import { useState, useEffect } from "react";

type CollapsibleSectionProps = {
  title: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  /** Optional content in the header (e.g. Edit link, action button) */
  headerAction?: React.ReactNode;
  /** Optional id for scroll targets (e.g. anchor links) */
  id?: string;
  /** When URL hash matches this (e.g. "mortgages"), expand on mount and when hash changes */
  expandWhenHash?: string;
};

export function CollapsibleSection({
  title,
  defaultExpanded = false,
  children,
  headerAction,
  id,
  expandWhenHash,
}: CollapsibleSectionProps) {
  const hashMatches = () =>
    typeof window !== "undefined" &&
    !!expandWhenHash &&
    window.location.hash === `#${expandWhenHash}`;

  const [expanded, setExpanded] = useState(
    () => (expandWhenHash && hashMatches()) || defaultExpanded
  );

  useEffect(() => {
    if (!expandWhenHash) return;
    const onHashChange = () => {
      if (window.location.hash === `#${expandWhenHash}`) setExpanded(true);
    };
    onHashChange(); // run on mount in case we landed with hash
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [expandWhenHash]);

  return (
    <section
      id={id}
      className="scroll-mt-20 rounded-lg border border-border bg-card overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-muted">
            {title}
          </h2>
          {headerAction && (
            <span onClick={(e) => e.stopPropagation()}>{headerAction}</span>
          )}
        </div>
        <span className="text-muted">{expanded ? "−" : "+"}</span>
      </button>
      {expanded && (
        <div className="border-t border-border px-6 pb-6 pt-4">
          {children}
        </div>
      )}
    </section>
  );
}
