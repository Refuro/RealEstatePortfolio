"use client";

import { useEffect, useRef, useState } from "react";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";

type AddressPrediction = {
  description: string;
  placeId: string;
};

type AddressSelection = {
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
};

type AddressAutocompleteInputProps = {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  onSelect: (address: AddressSelection) => void;
  required?: boolean;
  autoComplete?: string;
  className?: string;
};

export function AddressAutocompleteInput({
  id,
  value,
  onValueChange,
  onSelect,
  required,
  autoComplete,
  className = "",
}: AddressAutocompleteInputProps) {
  const [predictions, setPredictions] = useState<AddressPrediction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const requestSeqRef = useRef(0);
  const hideTimerRef = useRef<number | null>(null);
  const suppressTimerRef = useRef<number | null>(null);
  const hasFocusRef = useRef(false);
  // Blocks the autocomplete useEffect from firing during and briefly after
  // a prediction is selected — prevents the dropdown from reopening when
  // onSelect causes value to change to the parsed addressLine1.
  const isSelectingRef = useRef(false);

  function clearHideTimer() {
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }

  useEffect(() => {
    if (isSelectingRef.current) return;

    const query = value.trim();
    if (query.length < 3) {
      setPredictions([]);
      setOpen(false);
      return;
    }

    const seq = ++requestSeqRef.current;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(query)}`
        );
        if (!res.ok) {
          if (seq === requestSeqRef.current) {
            setPredictions([]);
            setOpen(false);
          }
          return;
        }
        const json = (await res.json()) as { predictions?: AddressPrediction[] };
        if (seq !== requestSeqRef.current) return;
        const next = Array.isArray(json.predictions) ? json.predictions : [];
        setPredictions(next);
        setOpen(next.length > 0 && hasFocusRef.current);
      } catch {
        if (seq === requestSeqRef.current) {
          setPredictions([]);
          setOpen(false);
        }
      } finally {
        if (seq === requestSeqRef.current) {
          setLoading(false);
        }
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    return () => {
      clearHideTimer();
      if (suppressTimerRef.current != null) {
        window.clearTimeout(suppressTimerRef.current);
      }
    };
  }, []);

  async function handlePredictionSelect(prediction: AddressPrediction) {
    // Suppress autocomplete for the duration of the selection + details fetch
    // so neither the full description string nor the parsed addressLine1 that
    // onSelect writes back triggers a new dropdown.
    isSelectingRef.current = true;
    if (suppressTimerRef.current != null) {
      window.clearTimeout(suppressTimerRef.current);
    }

    setOpen(false);
    setPredictions([]);

    try {
      const res = await fetch(
        `/api/places/details?placeId=${encodeURIComponent(prediction.placeId)}`
      );
      if (!res.ok) {
        // Fall back: write the raw description so the field isn't blank.
        onValueChange(prediction.description);
        return;
      }
      const json = (await res.json()) as Partial<AddressSelection>;
      if (
        typeof json.addressLine1 !== "string" ||
        typeof json.city !== "string" ||
        typeof json.state !== "string" ||
        typeof json.zipCode !== "string"
      ) {
        onValueChange(prediction.description);
        return;
      }
      onSelect({
        addressLine1: json.addressLine1,
        city: json.city,
        state: json.state,
        zipCode: json.zipCode,
      });
      captureClientEvent(AnalyticsEvents.ADDRESS_AUTOCOMPLETE_USED, {
        source: "google_places",
      });
    } catch {
      // Keep the input usable as a plain text field.
      onValueChange(prediction.description);
    } finally {
      // Re-enable autocomplete after the value has settled in the parent.
      suppressTimerRef.current = window.setTimeout(() => {
        isSelectingRef.current = false;
      }, 500);
    }
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value);
          if (!open && hasFocusRef.current && e.target.value.trim().length >= 3) {
            setOpen(true);
          }
        }}
        onFocus={() => {
          hasFocusRef.current = true;
          clearHideTimer();
          if (predictions.length > 0) setOpen(true);
        }}
        onBlur={() => {
          hasFocusRef.current = false;
          clearHideTimer();
          hideTimerRef.current = window.setTimeout(() => {
            if (document.activeElement !== inputRef.current) {
              setOpen(false);
            }
          }, 120);
        }}
        className={`${className} min-h-[44px]`}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={`${id}-predictions`}
      />
      {open && predictions.length > 0 && (
        <ul
          id={`${id}-predictions`}
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-card shadow-md"
          role="listbox"
        >
          {predictions.map((prediction) => (
            <li key={prediction.placeId}>
              <button
                type="button"
                className="flex min-h-[44px] w-full items-center px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-subtle"
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => void handlePredictionSelect(prediction)}
              >
                {prediction.description}
              </button>
            </li>
          ))}
        </ul>
      )}
      <span className="sr-only" aria-live="polite">
        {loading ? "Loading address suggestions" : ""}
      </span>
    </div>
  );
}
