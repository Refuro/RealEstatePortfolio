"use client";

type LocalDateProps = {
  /** ISO date string (e.g. from Date.toISOString()) */
  value: string;
  className?: string;
};

function formatLocalDate(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

export function LocalDate({ value, className }: LocalDateProps) {
  const formatted = formatLocalDate(value);
  return <span className={className}>{formatted ?? "—"}</span>;
}
