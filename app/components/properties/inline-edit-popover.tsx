"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CurrencyInput } from "@/components/currency-input";

type InlineFieldKind = "currency" | "percent" | "integer" | "fractional";

export type InlineEditPopoverProps = {
  /** Property id — drives the PATCH URL. */
  propertyId: string;
  /** API field name (e.g. "currentMonthlyRent", "currentMonthlyExpenses", "vacancyPercent"). */
  fieldName: string;
  /** Visible label inside the popover ("Monthly rent"). */
  label: string;
  /** Current value rendered in the input — strings only (forms use string state). */
  initialValue: string;
  /** Input variant. */
  kind: InlineFieldKind;
  /** Optional unit shown after the input (e.g. "sqft"). */
  unit?: string;
  /** Optional step override for number inputs. */
  step?: string;
  /** Optional minimum value for number inputs. */
  min?: number;
  /** Optional maximum value for number inputs. */
  max?: number;
  /** Optional helper text shown under the input. */
  hint?: ReactNode;
  /**
   * Optional client-side validator. Returns an error message string, or null on
   * success. Runs before the PATCH fires.
   */
  validate?: (value: string) => string | null;
  /**
   * Optional payload transformer. Defaults: currency → string number, percent → number.
   * Receives the raw input string; return is the value placed at `fieldName` in the body.
   */
  transformValue?: (value: string) => unknown;
  /** ARIA label for the trigger button. Defaults to "Edit {label}". */
  triggerAriaLabel?: string;
};

function defaultTransform(kind: InlineFieldKind, value: string): unknown {
  const cleaned = value.replace(/,/g, "").replace(/[^0-9.]/g, "");
  if (kind === "percent" || kind === "fractional") {
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  if (kind === "integer") {
    const n = parseInt(cleaned.replace(/\..*$/, ""), 10);
    return Number.isFinite(n) ? n : 0;
  }
  // currency: server-side schema accepts strings, mirroring rent-form / etc.
  return cleaned || "0";
}

const SAVED_INDICATOR_MS = 700;

export function InlineEditPopover({
  propertyId,
  fieldName,
  label,
  initialValue,
  kind,
  unit,
  step,
  min,
  max,
  hint,
  validate,
  transformValue,
  triggerAriaLabel,
}: InlineEditPopoverProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const inputId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Reset state when re-opened so it picks up the latest server value.
  useEffect(() => {
    if (open) {
      setValue(initialValue);
      setError(null);
      setSavedAt(null);
      // Focus the input on next tick.
      const t = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [open, initialValue]);

  // Click-outside + Escape close.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const validationError = validate?.(value) ?? null;
      if (validationError) {
        setError(validationError);
        return;
      }
      setSaving(true);
      setError(null);
      try {
        const transformed = (transformValue ?? ((v: string) => defaultTransform(kind, v)))(value);
        const res = await fetch(`/api/properties/${propertyId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ [fieldName]: transformed }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error ?? "Save failed");
          return;
        }
        setSavedAt(Date.now());
        router.refresh();
        window.setTimeout(() => setOpen(false), SAVED_INDICATOR_MS);
      } catch {
        setError("Network error");
      } finally {
        setSaving(false);
      }
    },
    [value, validate, transformValue, kind, propertyId, fieldName, router]
  );

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={triggerAriaLabel ?? `Edit ${label}`}
        className="ml-1 inline-flex size-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-subtle hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
      >
        <Pencil className="size-3.5" aria-hidden />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={`Edit ${label}`}
          className="absolute left-0 top-full z-30 mt-2 w-64 rounded-md border border-border bg-card p-3 shadow-lg"
        >
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor={inputId} className="block text-xs font-medium text-foreground">
              {label}
            </label>
            <div className="mt-1 flex items-center gap-1.5">
              {kind === "currency" ? (
                <span className="text-sm text-muted">$</span>
              ) : null}
              {kind === "currency" ? (
                <CurrencyInput
                  id={inputId}
                  value={value}
                  onChange={setValue}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
                  aria-label={label}
                />
              ) : (
                <input
                  ref={inputRef}
                  id={inputId}
                  type="number"
                  inputMode={kind === "integer" ? "numeric" : "decimal"}
                  min={
                    min ?? (kind === "percent" ? 0 : kind === "fractional" ? 0.5 : 0)
                  }
                  max={
                    max ?? (kind === "percent" ? 100 : kind === "fractional" ? 10 : undefined)
                  }
                  step={
                    step ??
                    (kind === "fractional"
                      ? "0.5"
                      : kind === "integer"
                      ? "1"
                      : "0.5")
                  }
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
                  aria-label={label}
                />
              )}
              {kind === "percent" ? (
                <span className="text-sm text-muted">%</span>
              ) : null}
              {unit ? <span className="text-sm text-muted">{unit}</span> : null}
            </div>
            {hint && <p className="mt-1 text-[11px] text-muted">{hint}</p>}
            {error && (
              <p className="mt-1 text-xs text-negative" role="alert">
                {error}
              </p>
            )}
            <div className="mt-2 flex items-center justify-end gap-2">
              <span
                className="mr-auto text-[11px] text-positive"
                aria-live="polite"
              >
                {savedAt ? "Saved ✓" : ""}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="rounded-md border border-transparent px-2 py-1 text-xs font-medium text-muted hover:text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || savedAt != null}
                className="rounded-md bg-accent px-3 py-1 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
              >
                {saving ? "Saving…" : savedAt ? "Saved ✓" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
