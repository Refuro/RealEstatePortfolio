"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CurrencyInput } from "@/components/currency-input";
import { AddressAutocompleteInput } from "@/components/property/address-autocomplete-input";
import { PropertySquareFeetField } from "@/components/property/property-square-feet-field";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-utils";
import { US_STATES } from "@/lib/us-states";
import { inputClass, inputErrorClass, labelClass } from "./form-styles";
import { initialSubformState, type SubformBaseProps, type SubformState } from "./types";

const SINGLE_UNIT_TYPES = ["single_family", "condo", "townhouse", "manufactured"] as const;
const MULTI_TYPES = ["multi_family", "apartment"] as const;

export type PropertyFactsInitial = {
  nickname: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  units: string;
  /** ISO yyyy-mm-dd. */
  purchaseDate: string;
  purchasePrice: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
};

export type PropertyFactsFormProps = SubformBaseProps & {
  propertyId: string;
  initial: PropertyFactsInitial;
};

function parseCurrencyNum(s: string): number {
  const cleaned = String(s ?? "").replace(/,/g, "").replace(/[^0-9.]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function PropertyFactsForm({
  propertyId,
  initial,
  onSaved,
  onCancel,
  onStateChange,
  hideActions,
  className = "",
  formId,
}: PropertyFactsFormProps) {
  const [nickname, setNickname] = useState(initial.nickname);
  const [addressLine1, setAddressLine1] = useState(initial.addressLine1);
  const [addressLine2, setAddressLine2] = useState(initial.addressLine2);
  const [city, setCity] = useState(initial.city);
  const [state, setState] = useState(initial.state);
  const [zipCode, setZipCode] = useState(initial.zipCode);
  const [propertyType, setPropertyType] = useState(initial.propertyType);
  const [units, setUnits] = useState(initial.units);
  const [purchaseDate, setPurchaseDate] = useState(initial.purchaseDate);
  const [purchasePrice, setPurchasePrice] = useState(initial.purchasePrice);
  const [bedrooms, setBedrooms] = useState(initial.bedrooms);
  const [bathrooms, setBathrooms] = useState(initial.bathrooms);
  const [squareFeet, setSquareFeet] = useState(initial.squareFeet);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formState, setFormState] = useState<SubformState>(initialSubformState);

  const stateChangeRef = useRef(onStateChange);
  useLayoutEffect(() => {
    stateChangeRef.current = onStateChange;
  });
  useEffect(() => {
    stateChangeRef.current?.(formState);
  }, [formState]);

  const handleAddressSelect = useCallback(
    (selected: {
      addressLine1: string;
      city: string;
      state: string;
      zipCode: string;
    }) => {
      setAddressLine1(selected.addressLine1);
      setCity(selected.city);
      setState(selected.state.toUpperCase());
      setZipCode(selected.zipCode);
      setFieldErrors((prev) => {
        if (
          !prev.addressLine1 &&
          !prev.city &&
          !prev.state &&
          !prev.zipCode
        ) {
          return prev;
        }
        const next = { ...prev };
        delete next.addressLine1;
        delete next.city;
        delete next.state;
        delete next.zipCode;
        return next;
      });
    },
    []
  );

  const isMulti = (MULTI_TYPES as readonly string[]).includes(propertyType);
  const isSingleUnit = (SINGLE_UNIT_TYPES as readonly string[]).includes(propertyType);
  const bedroomsLabel = isMulti ? "Typical unit bedrooms" : "Bedrooms";
  const bathroomsLabel = isMulti ? "Typical unit bathrooms" : "Bathrooms";

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!addressLine1.trim()) errors.addressLine1 = "Address is required.";
    if (!city.trim()) errors.city = "City is required.";
    if (!state.trim()) {
      errors.state = "State is required.";
    } else if (
      !US_STATES.includes(state.trim().toUpperCase() as (typeof US_STATES)[number])
    ) {
      errors.state = "Use a 2-letter state code (e.g. TX).";
    }
    if (!zipCode.trim()) errors.zipCode = "ZIP is required.";
    if (!purchaseDate.trim() || Number.isNaN(Date.parse(purchaseDate))) {
      errors.purchaseDate = "Enter a valid purchase date.";
    }
    if (parseCurrencyNum(purchasePrice) <= 0) {
      errors.purchasePrice = "Enter your actual purchase price.";
    }
    if (isMulti) {
      const u = parseInt(units, 10);
      if (!Number.isInteger(u) || u < 1 || u > 999) {
        errors.units = "Units must be between 1 and 999.";
      }
    }
    if (bedrooms.trim()) {
      const b = Number(bedrooms);
      if (!Number.isFinite(b) || b < 1 || b > 10 || !Number.isInteger(b)) {
        errors.bedrooms = "Bedrooms must be a whole number between 1 and 10.";
      }
    }
    if (bathrooms.trim()) {
      const b = Number(bathrooms);
      if (!Number.isFinite(b) || b < 0.5 || b > 10) {
        errors.bathrooms = "Bathrooms must be between 0.5 and 10.";
      } else if ((b * 2) % 1 !== 0) {
        errors.bathrooms = "Bathrooms must use 0.5 steps (e.g. 1.5, 2).";
      }
    }
    if (squareFeet.trim()) {
      const cleaned = squareFeet.trim().replace(/[^\d]/g, "");
      const s = parseInt(cleaned, 10);
      if (!Number.isFinite(s) || s < 100 || s > 500_000) {
        errors.squareFeet = "Square feet must be between 100 and 500,000.";
      }
    }
    return errors;
  }

  async function handleSubmit(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setFormState({ saving: true, saved: false, error: null });

    const payload: Record<string, unknown> = {
      nickname: nickname.trim() || null,
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2.trim() || null,
      city: city.trim(),
      state: state.trim().toUpperCase(),
      zipCode: zipCode.trim(),
      propertyType,
      units: isSingleUnit ? 1 : parseInt(units, 10) || 1,
      purchaseDate,
      purchasePrice,
      bedrooms: bedrooms.trim() ? Math.round(Number(bedrooms)) : null,
      bathrooms: bathrooms.trim() ? Number(bathrooms) : null,
      squareFeet: squareFeet.trim()
        ? parseInt(squareFeet.trim().replace(/[^\d]/g, ""), 10)
        : null,
    };

    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        details?: { fieldErrors?: Record<string, string[]> };
      };
      if (!res.ok) {
        const apiErrors: Record<string, string> = {};
        const fe = data.details?.fieldErrors ?? {};
        for (const [k, msgs] of Object.entries(fe)) {
          if (Array.isArray(msgs) && msgs[0]) apiErrors[k] = msgs[0];
        }
        setFieldErrors(apiErrors);
        setFormState({
          saving: false,
          saved: false,
          error: data.error ?? "Save failed",
        });
        return;
      }
      setFormState({ saving: false, saved: true, error: null });
      onSaved?.();
    } catch {
      setFormState({ saving: false, saved: false, error: "Network error" });
    }
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      className={`space-y-4 ${className}`}
      noValidate
    >
      <div>
        <label htmlFor="facts-nickname" className={labelClass}>
          Nickname (optional)
        </label>
        <input
          id="facts-nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className={inputClass}
          placeholder="e.g. Oakview Residence"
        />
      </div>

      <div>
        <label htmlFor="facts-addressLine1" className={labelClass}>
          Street address *
        </label>
        <AddressAutocompleteInput
          id="facts-addressLine1"
          value={addressLine1}
          onValueChange={setAddressLine1}
          onSelect={handleAddressSelect}
          required
          autoComplete="street-address"
          className={fieldErrors.addressLine1 ? inputErrorClass : inputClass}
        />
        {fieldErrors.addressLine1 && (
          <p className="mt-0.5 text-sm text-negative">{fieldErrors.addressLine1}</p>
        )}
      </div>

      <div>
        <label htmlFor="facts-addressLine2" className={labelClass}>
          Apt / unit (optional)
        </label>
        <input
          id="facts-addressLine2"
          type="text"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="facts-city" className={labelClass}>
            City *
          </label>
          <input
            id="facts-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={fieldErrors.city ? inputErrorClass : inputClass}
          />
          {fieldErrors.city && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.city}</p>
          )}
        </div>
        <div>
          <label htmlFor="facts-state" className={labelClass}>
            State *
          </label>
          <input
            id="facts-state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase())}
            maxLength={2}
            className={fieldErrors.state ? inputErrorClass : inputClass}
          />
          {fieldErrors.state && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.state}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="facts-zip" className={labelClass}>
          ZIP *
        </label>
        <input
          id="facts-zip"
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          className={`${fieldErrors.zipCode ? inputErrorClass : inputClass} max-w-[160px]`}
        />
        {fieldErrors.zipCode && (
          <p className="mt-0.5 text-sm text-negative">{fieldErrors.zipCode}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="facts-propertyType" className={labelClass}>
            Property type *
          </label>
          <select
            id="facts-propertyType"
            value={propertyType}
            onChange={(e) => {
              const next = e.target.value;
              setPropertyType(next);
              if ((SINGLE_UNIT_TYPES as readonly string[]).includes(next)) {
                setUnits("1");
              }
            }}
            className={inputClass}
          >
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {isMulti && (
          <div>
            <label htmlFor="facts-units" className={labelClass}>
              Units *
            </label>
            <input
              id="facts-units"
              type="number"
              min={1}
              max={999}
              inputMode="numeric"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className={fieldErrors.units ? inputErrorClass : inputClass}
            />
            {fieldErrors.units && (
              <p className="mt-0.5 text-sm text-negative">{fieldErrors.units}</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="facts-purchaseDate" className={labelClass}>
            Purchase date *
          </label>
          <input
            id="facts-purchaseDate"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className={fieldErrors.purchaseDate ? inputErrorClass : inputClass}
          />
          {fieldErrors.purchaseDate && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.purchaseDate}</p>
          )}
        </div>
        <div>
          <label htmlFor="facts-purchasePrice" className={labelClass}>
            Purchase price *
          </label>
          <CurrencyInput
            id="facts-purchasePrice"
            value={purchasePrice}
            onChange={(v) => {
              setPurchasePrice(v);
              if (fieldErrors.purchasePrice) {
                setFieldErrors((p) => {
                  const n = { ...p };
                  delete n.purchasePrice;
                  return n;
                });
              }
            }}
            required
            className={fieldErrors.purchasePrice ? inputErrorClass : inputClass}
          />
          {fieldErrors.purchasePrice && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.purchasePrice}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="facts-bedrooms" className={labelClass}>
            {bedroomsLabel}
          </label>
          <input
            id="facts-bedrooms"
            type="number"
            min={1}
            max={10}
            inputMode="numeric"
            placeholder="e.g. 3"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
            className={fieldErrors.bedrooms ? inputErrorClass : inputClass}
          />
          {fieldErrors.bedrooms && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.bedrooms}</p>
          )}
        </div>
        <div>
          <label htmlFor="facts-bathrooms" className={labelClass}>
            {bathroomsLabel}
          </label>
          <input
            id="facts-bathrooms"
            type="number"
            min={0.5}
            max={10}
            step={0.5}
            inputMode="decimal"
            placeholder="e.g. 2.5"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value)}
            className={fieldErrors.bathrooms ? inputErrorClass : inputClass}
          />
          {fieldErrors.bathrooms && (
            <p className="mt-0.5 text-sm text-negative">{fieldErrors.bathrooms}</p>
          )}
        </div>
      </div>

      <PropertySquareFeetField
        value={squareFeet}
        onChange={setSquareFeet}
        className="max-w-xs"
      />
      {fieldErrors.squareFeet && (
        <p className="mt-0.5 text-sm text-negative">{fieldErrors.squareFeet}</p>
      )}

      {formState.error && (
        <p className="rounded-md px-3 py-2 text-sm text-negative">{formState.error}</p>
      )}

      {!hideActions && (
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={formState.saving}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50"
          >
            {formState.saving ? "Saving…" : formState.saved ? "Saved ✓" : "Save"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium transition-colors duration-150 hover:bg-subtle"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </form>
  );
}
