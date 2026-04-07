type MobileFormGroupProps = {
  label?: string;
  children: React.ReactNode;
  className?: string;
};

export function MobileFormGroup({
  label,
  children,
  className = "",
}: MobileFormGroupProps) {
  return (
    <div className={className}>
      {label ? <p className="mb-2 text-[11px] font-medium text-muted">{label}</p> : null}
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export type { MobileFormGroupProps };
