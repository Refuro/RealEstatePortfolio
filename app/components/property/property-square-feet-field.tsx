"use client";

import {
  PROPERTY_INPUT_CLASS,
  PROPERTY_LABEL_CLASS,
} from "@/components/property/property-form-field-classes";

type PropertySquareFeetFieldProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Optional living area for RentCast AVM (`squareFootage` query param).
 */
export function PropertySquareFeetField({
  id = "squareFeet",
  name = "squareFeet",
  value,
  onChange,
  disabled,
  className = "",
}: PropertySquareFeetFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className={PROPERTY_LABEL_CLASS}>
        Square feet (optional)
      </label>
      <input
        id={id}
        name={name}
        type="number"
        min={100}
        max={500000}
        inputMode="numeric"
        placeholder="e.g. 1450"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={PROPERTY_INPUT_CLASS}
      />
      <p className="mt-0.5 text-xs text-muted">
        Improves rent and value estimates when using &quot;Estimate&quot; buttons.
      </p>
    </div>
  );
}
