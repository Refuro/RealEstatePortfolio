type MobileSectionCardProps = {
  children: React.ReactNode;
  className?: string;
  tone?: "surface" | "subtle" | "plain";
};

export function MobileSectionCard({
  children,
  className = "",
  tone = "surface",
}: MobileSectionCardProps) {
  const toneClass =
    tone === "surface"
      ? "rounded-2xl border border-border/70 bg-background/55 p-4 shadow-sm"
      : tone === "subtle"
        ? "rounded-2xl bg-background/35 p-3.5"
        : "";

  return (
    <div className={`${toneClass} ${className}`.trim()}>{children}</div>
  );
}
