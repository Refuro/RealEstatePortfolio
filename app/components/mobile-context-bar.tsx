type MobileContextBarProps = {
  title: string;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
};

export function MobileContextBar({
  title,
  subtitle,
  trailing,
}: MobileContextBarProps) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-3 px-4 py-2">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <h2 className="truncate text-lg font-semibold text-foreground">{title}</h2>
          {subtitle ? (
            <div className="flex min-w-0 items-center gap-1 text-sm text-muted">
              <span aria-hidden>·</span>
              <div className="min-w-0 truncate">{subtitle}</div>
            </div>
          ) : null}
        </div>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}

export type { MobileContextBarProps };
