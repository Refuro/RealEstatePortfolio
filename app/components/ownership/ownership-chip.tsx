type OwnershipChipProps = {
  ownershipPercent: number | null | undefined;
  size?: "sm" | "xs";
  onClick?: () => void;
};

export function OwnershipChip({ ownershipPercent, size = "sm", onClick }: OwnershipChipProps) {
  if (ownershipPercent == null || ownershipPercent >= 100) return null;

  const label = size === "xs" ? `${ownershipPercent}%` : `${ownershipPercent}% ownership`;
  const sizing =
    size === "xs"
      ? "px-1.5 py-0.5 text-[10px]"
      : "px-2.5 py-0.5 text-xs";
  const base = `inline-flex items-center rounded-full border border-accent/30 bg-accent/10 font-medium text-accent ${sizing}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} transition-colors hover:bg-accent/15`}
        aria-label={`Edit ownership: ${label}`}
      >
        {label}
      </button>
    );
  }

  return <span className={base}>{label}</span>;
}
