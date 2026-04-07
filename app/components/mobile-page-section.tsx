type MobilePageSectionProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: "grouped" | "flat";
  className?: string;
};

export function MobilePageSection({
  title,
  subtitle,
  children,
  variant = "grouped",
  className = "",
}: MobilePageSectionProps) {
  if (variant === "flat") {
    return (
      <section className={`border-t border-border pt-4 ${className}`.trim()}>
        {title ? <p className="mb-3 text-sm font-semibold text-foreground">{title}</p> : null}
        {children}
        {subtitle ? <p className="mt-2 text-xs text-muted">{subtitle}</p> : null}
      </section>
    );
  }

  return (
    <section className={className}>
      {title ? <p className="mb-2 px-1 text-xs font-medium text-muted">{title}</p> : null}
      <div className="rounded-xl bg-card">{children}</div>
      {subtitle ? <p className="mt-2 px-1 text-xs text-muted">{subtitle}</p> : null}
    </section>
  );
}

export type { MobilePageSectionProps };
