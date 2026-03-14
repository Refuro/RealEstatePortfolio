"use client";

/**
 * Formats a numeric string for display with thousands separators.
 * "1234567.50" -> "1,234,567.50"
 */
function formatForDisplay(value: string): string {
  const stripped = value.replace(/,/g, "");
  if (!stripped || stripped === ".") return "";
  const parts = stripped.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
}

/**
 * Parses user input to a raw numeric string (no commas).
 * "1,234,567.50" -> "1234567.50"
 */
function parseFromInput(value: string): string {
  const cleaned = value.replace(/,/g, "").replace(/[^0-9.]/g, "");
  const decimalIndex = cleaned.indexOf(".");
  if (decimalIndex === -1) return cleaned;
  return cleaned.slice(0, decimalIndex + 1) + cleaned.slice(decimalIndex + 1).replace(/\./g, "");
}

type CurrencyInputProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  "aria-label"?: string;
};

export function CurrencyInput({
  value,
  onChange,
  id,
  name,
  className,
  placeholder,
  required,
  "aria-label": ariaLabel,
}: CurrencyInputProps) {
  const displayValue = formatForDisplay(value);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseFromInput(e.target.value);
    onChange(raw);
  }

  return (
    <>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        aria-label={ariaLabel}
        className={className}
      />
      {name && <input type="hidden" name={name} value={value} />}
    </>
  );
}
