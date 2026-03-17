"use client";

type LocalDateTimeProps = {
  /** ISO date string (e.g. from Date.toISOString()) */
  value: string;
  className?: string;
};

function formatLocalDateTime(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function LocalDateTime({ value, className }: LocalDateTimeProps) {
  const formatted = formatLocalDateTime(value);
  return <span className={className}>{formatted ?? "—"}</span>;
}
