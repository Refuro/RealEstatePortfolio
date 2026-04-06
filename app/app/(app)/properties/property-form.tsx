"use client";

import { UpgradePlanLink } from "@/components/analytics/upgrade-plan-link";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CurrencyInput } from "@/components/currency-input";
import { US_STATES } from "@/lib/us-states";
import { PROPERTY_TYPE_LABELS } from "@/lib/property-utils";
import { PropertySquareFeetField } from "@/components/property/property-square-feet-field";
import { RentCastQuotaHint } from "@/components/rentcast-quota-hint";
import { PROPERTY_EDIT_SECTION_NAV } from "@/lib/property-form-section-nav";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { getPropertyCompleteness } from "@/lib/property-completeness";

function formatZodApiDetails(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const d = details as { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
  const parts: string[] = [];
  if (Array.isArray(d.formErrors) && d.formErrors.length) parts.push(...d.formErrors);
  for (const [key, msgs] of Object.entries(d.fieldErrors ?? {})) {
    if (Array.isArray(msgs) && msgs.length) parts.push(`${key}: ${msgs.join(", ")}`);
  }
  return parts.length ? parts.join(" · ") : null;
}

type PropertyFormData = {
  nickname?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  units: number;
  ownershipPercent: number;
  purchasePrice: string;
  purchaseDate: string;
  currentEstimatedValue: string;
  isRented: boolean;
  currentMonthlyRent: string;
  unitRents?: string[];
  currentMonthlyExpenses: string;
  vacancyPercent?: number;
  cashInvested?: string;
  bedrooms?: number;
  bathrooms?: string;
  /** Optional; displayed on property details page */
  squareFeet?: number | null;
  notes?: string;
};

const defaultValues: PropertyFormData = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  propertyType: "single_family",
  units: 1,
  ownershipPercent: 100,
  purchasePrice: "",
  purchaseDate: "",
  currentEstimatedValue: "",
  isRented: true,
  currentMonthlyRent: "",
  currentMonthlyExpenses: "",
  cashInvested: "",
  notes: "",
};

const MISSING_FIELD_TO_SECTION: Record<string, string> = {
  "actual purchase price": "section-economics",
  "cash invested": "section-economics",
  "mortgage status": "section-mortgage",
  "mortgage details": "section-mortgage",
  bedrooms: "section-location",
  bathrooms: "section-location",
  "square feet": "section-location",
};

const MISSING_LABEL_TO_FIELD_IDS: Record<string, string[]> = {
  "cash invested": ["cashInvested"],
  bedrooms: ["bedrooms"],
  bathrooms: ["bathrooms"],
  "square feet": ["squareFeet"],
};

type PropertyFormProps = {
  className?: string;
  property?: PropertyFormData & { id: string };
  /** When true, fires the enrichment_started analytics event on mount. */
  initialIsIncomplete?: boolean;
  /** Number of existing mortgages on this property (for live completeness scoring). */
  mortgageCount?: number;
  /** Current hasMortgage value from DB (null = unanswered). */
  hasMortgage?: boolean | null;
};

export function PropertyForm({ className = "", property, initialIsIncomplete = false, mortgageCount: initialMortgageCount = 0, hasMortgage: initialHasMortgage = null }: PropertyFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const hasScrolledRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [rentCastQuotaTick, setRentCastQuotaTick] = useState(0);
  const [valueEstimateLoading, setValueEstimateLoading] = useState(false);
  const [valueEstimateError, setValueEstimateError] = useState<string | null>(null);
  const [lastValueEstimate, setLastValueEstimate] = useState<string>("");
  const [lastRentEstimate, setLastRentEstimate] = useState<string>("");

  function highlightSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.classList.add("ring-2", "ring-accent/40", "rounded-xl", "transition-shadow", "duration-500");
    setTimeout(() => {
      el.classList.remove("ring-2", "ring-accent/40");
      el.classList.add("ring-0");
      setTimeout(() => {
        el.classList.remove("rounded-xl", "transition-shadow", "duration-500", "ring-0");
      }, 500);
    }, 2500);
  }

  useEffect(() => {
    if (property && initialIsIncomplete) {
      captureClientEvent(AnalyticsEvents.PROPERTY_ENRICHMENT_STARTED, {
        property_id: property.id,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!property || !initialIsIncomplete || hasScrolledRef.current) return;
    hasScrolledRef.current = true;
    const initial = getPropertyCompleteness({
      purchasePrice: parseCurrencyNum(property.purchasePrice),
      currentEstimatedValue: parseCurrencyNum(property.currentEstimatedValue),
      cashInvested: property.cashInvested ? parseCurrencyNum(property.cashInvested) : null,
      mortgageCount: initialMortgageCount,
      hasMortgage: initialHasMortgage,
      bedrooms: property.bedrooms ?? null,
      bathrooms: property.bathrooms != null ? Number(property.bathrooms) : null,
      squareFeet: property.squareFeet ?? null,
    });
    const section = initial.missingFields[0]
      ? MISSING_FIELD_TO_SECTION[initial.missingFields[0]]
      : null;
    if (!section) return;
    const timer = setTimeout(() => {
      highlightSection(section);
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function parseCurrencyNum(s: string): number {
    const cleaned = String(s ?? "").replace(/,/g, "").replace(/[^0-9.]/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  function clearEstimatesOnAddressChange() {
    setLastValueEstimate("");
    setLastRentEstimate("");
  }
  const [propertyType, setPropertyType] = useState(property?.propertyType ?? "single_family");
  const [units, setUnits] = useState(property?.units ?? 1);
  const [purchasePrice, setPurchasePrice] = useState(property?.purchasePrice ?? "");
  const [currentEstimatedValue, setCurrentEstimatedValue] = useState(property?.currentEstimatedValue ?? "");
  const [cashInvested, setCashInvested] = useState(property?.cashInvested ?? "");
  const [currentMonthlyRent, setCurrentMonthlyRent] = useState(property?.currentMonthlyRent ?? "");
  const [isRented, setIsRented] = useState(property?.isRented ?? true);
  const hasExistingUnitRents = Array.isArray(property?.unitRents) && (property.unitRents as string[]).length > 0;
  const [unitRents, setUnitRents] = useState<string[]>(() => {
    const ur = property?.unitRents;
    if (Array.isArray(ur) && ur.length > 0) return ur.map(String);
    const n = property?.units ?? 1;
    return Array(n).fill("");
  });
  const [currentMonthlyExpenses, setCurrentMonthlyExpenses] = useState(property?.currentMonthlyExpenses ?? "");
  const [vacancyPercent, setVacancyPercent] = useState(property?.vacancyPercent != null ? String(property.vacancyPercent) : "5");
  const [bedrooms, setBedrooms] = useState(property?.bedrooms != null ? String(property.bedrooms) : "");
  const [bathrooms, setBathrooms] = useState(property?.bathrooms ?? "");
  const [squareFeet, setSquareFeet] = useState(
    () => (property?.squareFeet != null ? String(property.squareFeet) : "")
  );
  const liveCompleteness =
    property && initialIsIncomplete
      ? getPropertyCompleteness({
          purchasePrice: parseCurrencyNum(purchasePrice),
          currentEstimatedValue: parseCurrencyNum(currentEstimatedValue),
          cashInvested:
            cashInvested.trim() && parseCurrencyNum(cashInvested) > 0
              ? parseCurrencyNum(cashInvested)
              : null,
          mortgageCount: initialMortgageCount,
          hasMortgage: initialHasMortgage,
          bedrooms: bedrooms.trim() ? Number(bedrooms) : null,
          bathrooms: bathrooms.trim() ? Number(bathrooms) : null,
          squareFeet: squareFeet.trim() ? Number(squareFeet) : null,
        })
      : null;

  const firstMissingSection = liveCompleteness?.missingFields[0]
    ? MISSING_FIELD_TO_SECTION[liveCompleteness.missingFields[0]]
    : null;

  const sectionMissingCounts = liveCompleteness
    ? liveCompleteness.missingFields.reduce<Record<string, number>>((acc, field) => {
        const section = MISSING_FIELD_TO_SECTION[field];
        if (section) acc[section] = (acc[section] || 0) + 1;
        return acc;
      }, {})
    : {};

  const missingFieldIds = new Set(
    (liveCompleteness?.missingFields ?? []).flatMap(
      (label) => MISSING_LABEL_TO_FIELD_IDS[label] ?? []
    )
  );

  function fieldInputClass(fieldId: string): string {
    if (!initialIsIncomplete || !missingFieldIds.has(fieldId)) return inputClass;
    return `${inputClass} ring-2 ring-accent/15`;
  }

  const isEdit = !!property;
  const unitCount =
    propertyType === "multi_family" || propertyType === "apartment"
      ? Math.min(999, Math.max(1, units))
      : 1;
  const isMulti =
    (propertyType === "multi_family" || propertyType === "apartment") && unitCount > 1;
  const unitRentsDisplay = (() => {
    const arr = [...unitRents];
    while (arr.length < unitCount) arr.push("");
    return arr.length > unitCount ? arr.slice(0, unitCount) : arr;
  })();
  const totalRentDisplay = unitRentsDisplay.reduce(
    (s, r) => s + parseCurrencyNum(r),
    0
  );
  const valueMatchesLastEstimate = Boolean(
    lastValueEstimate &&
      parseCurrencyNum(currentEstimatedValue) === parseCurrencyNum(lastValueEstimate)
  );
  const rentMatchesLastEstimate = Boolean(
    lastRentEstimate &&
      (isMulti && hasExistingUnitRents
        ? Math.round(totalRentDisplay) === parseCurrencyNum(lastRentEstimate)
        : parseCurrencyNum(currentMonthlyRent) === parseCurrencyNum(lastRentEstimate))
  );
  const values = property
    ? {
        nickname: property.nickname ?? "",
        addressLine1: property.addressLine1,
        addressLine2: property.addressLine2 ?? "",
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        propertyType: property.propertyType,
        units: property.units,
        ownershipPercent: property.ownershipPercent ?? 100,
        purchasePrice: property.purchasePrice,
        purchaseDate: property.purchaseDate,
        currentEstimatedValue: property.currentEstimatedValue,
        isRented: property.isRented ?? true,
        currentMonthlyRent: property.currentMonthlyRent,
        currentMonthlyExpenses: property.currentMonthlyExpenses,
        cashInvested: property.cashInvested ?? "",
        notes: property.notes ?? "",
      }
    : defaultValues;

  async function handleEstimateValue() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const addressLine1 = (fd.get("addressLine1") as string)?.trim();
    const city = (fd.get("city") as string)?.trim();
    const state = (fd.get("state") as string)?.trim();
    const zipCode = (fd.get("zipCode") as string)?.trim();
    if (!addressLine1 || !city || !state || !zipCode) {
      setValueEstimateError("Enter address first");
      return;
    }
    setValueEstimateError(null);
    setValueEstimateLoading(true);
    try {
      const params = new URLSearchParams({
        addressLine1,
        city,
        state,
        zipCode,
      });
      const addressLine2 = (fd.get("addressLine2") as string)?.trim();
      if (addressLine2) params.set("addressLine2", addressLine2);
      params.set("propertyType", propertyType);
      const res = await fetch(`/api/estimates/value?${params.toString()}`);
      const json = (await res.json()) as { value?: number; error?: string };
      if (json.value != null && Number.isFinite(json.value)) {
        const val = String(Math.round(json.value));
        setCurrentEstimatedValue(val);
        setLastValueEstimate(val);
        setRentCastQuotaTick((t) => t + 1);
      } else {
        setValueEstimateError(json.error ?? "Estimate unavailable for this address");
      }
    } catch {
      setValueEstimateError("Estimate unavailable for this address");
    } finally {
      setValueEstimateLoading(false);
    }
  }

  async function handleEstimateRent() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const addressLine1 = (fd.get("addressLine1") as string)?.trim();
    const city = (fd.get("city") as string)?.trim();
    const state = (fd.get("state") as string)?.trim();
    const zipCode = (fd.get("zipCode") as string)?.trim();
    if (!addressLine1 || !city || !state || !zipCode) {
      setEstimateError("Enter address first");
      return;
    }
    setEstimateError(null);
    setEstimateLoading(true);
    try {
      const params = new URLSearchParams({
        addressLine1,
        city,
        state,
        zipCode,
      });
      const addressLine2 = (fd.get("addressLine2") as string)?.trim();
      if (addressLine2) params.set("addressLine2", addressLine2);
      params.set("propertyType", propertyType);
      if (isMulti) params.set("units", String(unitCount));
      if (property?.id) params.set("propertyId", property.id);
      const res = await fetch(`/api/estimates/rent?${params.toString()}`);
      const json = (await res.json()) as { rent?: number; error?: string };
      if (json.rent != null && Number.isFinite(json.rent)) {
        setRentCastQuotaTick((t) => t + 1);
        const val = String(Math.round(json.rent));
        setLastRentEstimate(val);
        if (isMulti && hasExistingUnitRents) {
          const perUnit = Math.round(json.rent / unitCount);
          setUnitRents(Array(unitCount).fill(String(perUnit)));
        } else {
          setCurrentMonthlyRent(val);
        }
      } else {
        setEstimateError(json.error ?? "Estimate unavailable for this address");
      }
    } catch {
      setEstimateError("Estimate unavailable for this address");
    } finally {
      setEstimateLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const u =
      ["single_family", "condo", "townhouse", "manufactured"].includes(propertyType)
        ? 1
        : Number(formData.get("units")) || unitCount;
    const unitRentsArr =
      isRented && isMulti && unitRentsDisplay.some((s) => (Number(s) || 0) > 0)
        ? unitRentsDisplay.slice(0, u).map((s) => Number(s) || 0)
        : null;
    const totalRent =
      !isRented
        ? 0
        : unitRentsArr != null
        ? unitRentsArr.reduce((a, b) => a + b, 0)
        : Number(currentMonthlyRent) || 0;

    const payload: Record<string, unknown> = {
      nickname: (formData.get("nickname") as string) || null,
      addressLine1: formData.get("addressLine1") as string,
      addressLine2: (formData.get("addressLine2") as string) || null,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      propertyType: formData.get("propertyType") as string,
      units: u,
      ownershipPercent: Math.min(100, Math.max(1, Number(formData.get("ownershipPercent")) || 100)),
      purchasePrice,
      purchaseDate: formData.get("purchaseDate") as string,
      currentEstimatedValue,
      isRented,
      currentMonthlyRent: String(totalRent),
      currentMonthlyExpenses,
      vacancyPercent: Math.min(100, Math.max(0, Number(vacancyPercent) || 5)),
      cashInvested: cashInvested.trim() || null,
      notes: (formData.get("notes") as string) || null,
    };
    if (unitRentsArr != null) payload.unitRents = unitRentsArr;
    if (bedrooms.trim()) {
      const b = Number(bedrooms);
      if (!Number.isNaN(b) && b >= 1 && b <= 10) payload.bedrooms = Math.round(b);
    }
    if (bathrooms.trim()) {
      const b = Number(bathrooms);
      if (!Number.isNaN(b) && b >= 0.5 && b <= 10) payload.bathrooms = b;
    }
    if (squareFeet.trim()) {
      const s = parseInt(squareFeet.trim(), 10);
      if (!Number.isNaN(s) && s >= 100) payload.squareFeet = s;
    } else if (isEdit) {
      payload.squareFeet = null;
    }

    try {
      const url = isEdit ? `/api/properties/${property.id}` : "/api/properties";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
        details?: unknown;
        id?: string;
      };
      if (!res.ok) {
        if (!isEdit && data.code === "PLAN_LIMIT_REACHED") {
          captureClientEvent(AnalyticsEvents.PLAN_LIMIT_HIT, {
            resource: "property",
          });
        }
        const planMsg =
          data.code === "PLAN_LIMIT_REACHED"
            ? "Property limit reached. Upgrade your plan or remove a property to add more."
            : null;
        const detailMsg = formatZodApiDetails(data.details);
        setError(planMsg ?? detailMsg ?? data.error ?? "Something went wrong");
        setSubmitting(false);
        return;
      }
      if (!isEdit && typeof data.id === "string") {
        captureClientEvent(AnalyticsEvents.PROPERTY_CREATED, {
          property_id: data.id,
        });
      }
      if (isEdit && initialIsIncomplete) {
        const cashNum = payload.cashInvested != null ? Number(payload.cashInvested) : null;
        const afterSave = getPropertyCompleteness({
          purchasePrice: parseCurrencyNum(purchasePrice),
          currentEstimatedValue: parseCurrencyNum(currentEstimatedValue),
          cashInvested: cashNum && cashNum > 0 ? cashNum : null,
          mortgageCount: initialMortgageCount,
          hasMortgage: initialHasMortgage,
          bedrooms: bedrooms.trim() ? Number(bedrooms) : null,
          bathrooms: bathrooms.trim() ? Number(bathrooms) : null,
          squareFeet: squareFeet.trim() ? Number(squareFeet) : null,
        });
        if (afterSave.isComplete) {
          captureClientEvent(AnalyticsEvents.PROPERTY_ENRICHMENT_COMPLETED, {
            property_id: property.id,
          });
        }
      }
      router.push(`/properties/${isEdit ? property.id : data.id}`);
      router.refresh();
    } catch {
      setError("Network error");
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelClass = "block text-sm font-medium text-muted";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm ${className}`}
    >
      {error && (
        <div className="rounded-md px-4 py-2 text-sm text-negative">
          {error}
          {(error.includes("Upgrade") || error.includes("limit")) && (
            <UpgradePlanLink
              placement="property_form_plan_limit"
              className="ml-1 font-medium underline hover:no-underline"
            >
              Upgrade plan
            </UpgradePlanLink>
          )}
        </div>
      )}

      {liveCompleteness && !liveCompleteness.isComplete && (
        <div className="rounded-lg bg-subtle/40 p-4">
          <p className="text-sm font-semibold text-foreground">
            {liveCompleteness.missingFields.length} field
            {liveCompleteness.missingFields.length !== 1 ? "s" : ""} remaining for full metrics
          </p>
          <p className="mt-1 text-xs text-muted">
            Complete these: {liveCompleteness.missingFields.join(", ")}.
          </p>
          {firstMissingSection && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                captureClientEvent(
                  AnalyticsEvents.COMPLETION_GUIDANCE_JUMP_CLICKED,
                  {
                    property_id: property?.id,
                    target_section: firstMissingSection,
                  }
                );
                highlightSection(firstMissingSection);
              }}
              className="mt-3 inline-flex min-h-[44px] items-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-subtle"
            >
              Jump to first missing field
            </button>
          )}
        </div>
      )}

      {isEdit && (
        <nav
          aria-label="Edit property sections"
          className="sticky top-0 z-10 -mx-6 mb-8 border-b border-border bg-card px-6 py-3"
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Jump to</p>
          <ul className="flex gap-x-4 gap-y-2 overflow-x-auto text-sm md:flex-wrap">
            {PROPERTY_EDIT_SECTION_NAV.map((s) => {
              const missingCount = sectionMissingCounts[s.id] || 0;
              return (
                <li key={s.id} className="shrink-0">
                  <a
                    href={`#${s.id}`}
                    className="inline-flex min-h-[44px] items-center gap-1.5 text-accent transition-colors duration-150 hover:text-accent-hover"
                  >
                    {s.label}
                    {missingCount > 0 && (
                      <span className="inline-flex items-center rounded-full bg-accent/10 px-1.5 py-0.5 text-xs font-medium tabular-nums text-accent">
                        {missingCount}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <div className="space-y-10">
        <section
          id="section-location"
          tabIndex={-1}
          className="scroll-mt-28 border-b border-border pb-10"
          aria-labelledby="heading-edit-location"
        >
          <h2 id="heading-edit-location" className="text-xl font-semibold text-foreground">
            Location &amp; profile
          </h2>
          <p className="mt-1 text-sm text-muted">
            Address, property type, units, and optional property details.
          </p>
          <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="nickname" className={labelClass}>
            Nickname (optional)
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            defaultValue={values.nickname}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="addressLine1" className={labelClass}>
            Address line 1 *
          </label>
          <input
            id="addressLine1"
            name="addressLine1"
            type="text"
            required
            autoComplete="street-address"
            defaultValue={values.addressLine1}
            onChange={clearEstimatesOnAddressChange}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="addressLine2" className={labelClass}>
            Address line 2 (optional)
          </label>
          <input
            id="addressLine2"
            name="addressLine2"
            type="text"
            autoComplete="address-line2"
            defaultValue={values.addressLine2}
            onChange={clearEstimatesOnAddressChange}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="city" className={labelClass}>
              City *
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              autoComplete="address-level2"
              defaultValue={values.city}
              onChange={clearEstimatesOnAddressChange}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="state" className={labelClass}>
              State *
            </label>
            <select
              id="state"
              name="state"
              required
              defaultValue={values.state || ""}
              onChange={clearEstimatesOnAddressChange}
              className={inputClass}
            >
              <option value="">Select state</option>
              {US_STATES.map((abbr) => (
                <option key={abbr} value={abbr}>
                  {abbr}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="zipCode" className={labelClass}>
              ZIP *
            </label>
            <input
              id="zipCode"
              name="zipCode"
              type="text"
              required
              inputMode="numeric"
              autoComplete="postal-code"
              defaultValue={values.zipCode}
              onChange={clearEstimatesOnAddressChange}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="propertyType" className={labelClass}>
              Property type
            </label>
            <select
              id="propertyType"
              name="propertyType"
              defaultValue={values.propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className={inputClass}
            >
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {(propertyType === "multi_family" || propertyType === "apartment") && (
            <div>
              <label htmlFor="units" className={labelClass}>
                Units
              </label>
              <input
                id="units"
                name="units"
                type="number"
                min={1}
                max={999}
                inputMode="numeric"
                value={units}
                onChange={(e) => {
                  const n = Math.min(999, Math.max(1, Number(e.target.value) || 1));
                  setUnits(n);
                  const prev = unitRents.length;
                  if (prev < n) setUnitRents([...unitRents, ...Array(n - prev).fill("")]);
                  else if (prev > n) setUnitRents(unitRents.slice(0, n));
                }}
                className={inputClass}
              />
            </div>
          )}
          {["single_family", "condo", "townhouse", "manufactured"].includes(propertyType) && (
            <input type="hidden" name="units" value="1" />
          )}
        </div>

        {["single_family", "condo", "townhouse", "manufactured"].includes(propertyType) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bedrooms" className={labelClass}>
                Bedrooms (optional)
              </label>
              <input
                id="bedrooms"
                type="number"
                min={1}
                max={10}
                inputMode="numeric"
                placeholder="e.g. 3"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className={inputClass}
              />
              <p className="mt-0.5 text-xs text-muted">Shown on your property details page</p>
            </div>
            <div>
              <label htmlFor="bathrooms" className={labelClass}>
                Bathrooms (optional)
              </label>
              <input
                id="bathrooms"
                type="number"
                min={0.5}
                max={10}
                step={0.5}
                inputMode="decimal"
                placeholder="e.g. 2.5"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className={inputClass}
              />
              <p className="mt-0.5 text-xs text-muted">Shown on your property details page</p>
            </div>
          </div>
        )}
        {(propertyType === "multi_family" || propertyType === "apartment") && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bedrooms" className={labelClass}>
                Typical unit bedrooms (optional)
              </label>
              <input
                id="bedrooms"
                type="number"
                min={1}
                max={10}
                inputMode="numeric"
                placeholder="e.g. 2"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className={inputClass}
              />
              <p className="mt-0.5 text-xs text-muted">Shown on your property details page</p>
            </div>
            <div>
              <label htmlFor="bathrooms" className={labelClass}>
                Typical unit bathrooms (optional)
              </label>
              <input
                id="bathrooms"
                type="number"
                min={0.5}
                max={10}
                step={0.5}
                inputMode="decimal"
                placeholder="e.g. 1.5"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                className={inputClass}
              />
              <p className="mt-0.5 text-xs text-muted">Shown on your property details page</p>
            </div>
          </div>
        )}

        <PropertySquareFeetField
          value={squareFeet}
          onChange={setSquareFeet}
          className="max-w-xs"
        />

          </div>
        </section>

        <section
          id="section-economics"
          tabIndex={-1}
          className="scroll-mt-28 border-b border-border pb-10"
          aria-labelledby="heading-edit-economics"
        >
          <h2 id="heading-edit-economics" className="text-xl font-semibold text-foreground">
            Purchase &amp; value
          </h2>
          <p className="mt-1 text-sm text-muted">
            What you paid, current estimated value, cash invested, and ownership share.
          </p>
          <div className="mt-4 space-y-4">
            <RentCastQuotaHint refreshKey={rentCastQuotaTick} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="purchasePrice" className={labelClass}>
              Purchase price *
            </label>
            <CurrencyInput
              id="purchasePrice"
              value={purchasePrice}
              onChange={setPurchasePrice}
              required
              className={inputClass}
            />
            {initialIsIncomplete &&
              purchasePrice.trim() &&
              Math.round(parseCurrencyNum(purchasePrice)) === Math.round(parseCurrencyNum(currentEstimatedValue)) && (
                <p className="mt-1 text-xs text-accent">
                  This may have been auto-filled. Update if it doesn&apos;t reflect your actual purchase price.
                </p>
              )}
          </div>
          <div>
            <label htmlFor="purchaseDate" className={labelClass}>
              Purchase date *
            </label>
            <input
              id="purchaseDate"
              name="purchaseDate"
              type="date"
              required
              defaultValue={values.purchaseDate}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="currentEstimatedValue" className={labelClass}>
              Current estimated value *
            </label>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <CurrencyInput
                  id="currentEstimatedValue"
                  value={currentEstimatedValue}
                  onChange={setCurrentEstimatedValue}
                  required
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={handleEstimateValue}
                disabled={valueEstimateLoading || valueMatchesLastEstimate}
                className="shrink-0 self-end rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium hover:bg-subtle disabled:opacity-50"
              >
                {valueEstimateLoading ? "Estimating…" : "Estimate value"}
              </button>
            </div>
            {valueEstimateError && (
              <p className={`mt-0.5 text-sm ${valueEstimateError?.includes("estimate limit") ? "text-negative" : "text-muted"}`}>{valueEstimateError}</p>
            )}
          </div>
          <div>
            <label htmlFor="cashInvested" className={labelClass}>
              Cash invested (optional)
            </label>
            <CurrencyInput
              id="cashInvested"
              value={cashInvested}
              onChange={setCashInvested}
              className={fieldInputClass("cashInvested")}
            />
          </div>
        </div>

        <div>
          <label htmlFor="ownershipPercent" className={labelClass}>
            Ownership %
          </label>
          <input
            id="ownershipPercent"
            name="ownershipPercent"
            type="number"
            min={1}
            max={100}
            inputMode="numeric"
            defaultValue={values.ownershipPercent}
            className={inputClass}
          />
          <p className="mt-0.5 text-xs text-muted">
            Your share of the property (1–100%). Use 100 for full ownership.
          </p>
        </div>

          </div>
        </section>

        <section
          id="section-income"
          tabIndex={-1}
          className="scroll-mt-28 border-b border-border pb-10"
          aria-labelledby="heading-edit-income"
        >
          <h2 id="heading-edit-income" className="text-xl font-semibold text-foreground">
            Income &amp; expenses
          </h2>
          <p className="mt-1 text-sm text-muted">Rent, operating expenses, and vacancy assumption.</p>
          <div className="mt-4 space-y-4">
            <RentCastQuotaHint refreshKey={rentCastQuotaTick} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 rounded-md border border-border bg-subtle/20 p-3">
            <p className="text-sm font-medium text-foreground">Is this property currently rented?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIsRented(true)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  isRented
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background text-foreground hover:bg-subtle"
                }`}
              >
                Yes, rented
              </button>
              <button
                type="button"
                onClick={() => setIsRented(false)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  !isRented
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background text-foreground hover:bg-subtle"
                }`}
              >
                No, not rented
              </button>
            </div>
            {!isRented && (
              <p className="mt-2 text-xs text-muted">
                Not currently rented - income is saved as $0 until this is marked rented.
              </p>
            )}
          </div>
          {isMulti && hasExistingUnitRents ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-end gap-2">
                {unitRentsDisplay.map((_, i) => (
                  <div key={i} className="min-w-0 w-full flex-1 sm:min-w-[100px] sm:w-auto">
                    <label htmlFor={`unitRent-${i}`} className={labelClass}>
                      Unit {i + 1} rent {isRented ? "*" : ""}
                    </label>
                    <CurrencyInput
                      id={`unitRent-${i}`}
                      value={unitRentsDisplay[i] ?? ""}
                      onChange={(v) => {
                        const next = [...unitRentsDisplay];
                        next[i] = v;
                        setUnitRents(next);
                      }}
                      required={isRented}
                      className={inputClass}
                    />
                  </div>
                ))}
                {isRented && (
                  <button
                    type="button"
                    onClick={handleEstimateRent}
                    disabled={estimateLoading || rentMatchesLastEstimate}
                    className="shrink-0 self-end rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium hover:bg-subtle disabled:opacity-50"
                  >
                    {estimateLoading ? "Estimating…" : "Estimate rent"}
                  </button>
                )}
              </div>
              <p className="text-sm text-muted">
                {isRented
                  ? `Total: $${unitRentsDisplay
                      .reduce((s, r) => s + (Number(r) || 0), 0)
                      .toLocaleString()}/mo`
                  : "Monthly rent will be saved as $0 while not rented."}
              </p>
              {estimateError && (
                <p className={`text-sm ${estimateError?.includes("estimate limit") ? "text-negative" : "text-muted"}`}>{estimateError}</p>
              )}
            </div>
          ) : isMulti ? (
            <div>
              <label htmlFor="currentMonthlyRent" className={labelClass}>
                Total monthly rent {isRented ? "*" : ""}
              </label>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <CurrencyInput
                    id="currentMonthlyRent"
                    value={currentMonthlyRent}
                    onChange={setCurrentMonthlyRent}
                    required={isRented}
                    className={inputClass}
                  />
                </div>
                {isRented && (
                  <button
                    type="button"
                    onClick={handleEstimateRent}
                    disabled={estimateLoading || rentMatchesLastEstimate}
                    className="shrink-0 self-end rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium hover:bg-subtle disabled:opacity-50"
                  >
                    {estimateLoading ? "Estimating…" : "Estimate rent"}
                  </button>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {isRented
                  ? `Will be split evenly across ${unitCount} units on save`
                  : "Monthly rent will be saved as $0 while not rented."}
              </p>
              {estimateError && (
                <p className={`mt-0.5 text-sm ${estimateError?.includes("estimate limit") ? "text-negative" : "text-muted"}`}>{estimateError}</p>
              )}
            </div>
          ) : (
            <div>
              <label htmlFor="currentMonthlyRent" className={labelClass}>
                Monthly rent {isRented ? "*" : ""}
              </label>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <CurrencyInput
                    id="currentMonthlyRent"
                    value={currentMonthlyRent}
                    onChange={setCurrentMonthlyRent}
                    required={isRented}
                    className={inputClass}
                  />
                </div>
                {isRented && (
                  <button
                    type="button"
                    onClick={handleEstimateRent}
                    disabled={estimateLoading || rentMatchesLastEstimate}
                    className="shrink-0 self-end rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium hover:bg-subtle disabled:opacity-50"
                  >
                    {estimateLoading ? "Estimating…" : "Estimate rent"}
                  </button>
                )}
              </div>
              {!isRented && (
                <p className="mt-0.5 text-xs text-muted">
                  Monthly rent will be saved as $0 while not rented.
                </p>
              )}
              {estimateError && (
                <p className={`mt-0.5 text-sm ${estimateError?.includes("estimate limit") ? "text-negative" : "text-muted"}`}>{estimateError}</p>
              )}
            </div>
          )}
          <div>
            <label htmlFor="currentMonthlyExpenses" className={labelClass}>
              Monthly expenses *
            </label>
            <CurrencyInput
              id="currentMonthlyExpenses"
              value={currentMonthlyExpenses}
              onChange={setCurrentMonthlyExpenses}
              required
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="vacancyPercent" className={labelClass}>
            Vacancy %
          </label>
          <input
            id="vacancyPercent"
            name="vacancyPercent"
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            value={vacancyPercent}
            onChange={(e) => setVacancyPercent(e.target.value)}
            className={inputClass}
          />
          <p className="mt-0.5 text-xs text-muted">
            Expected vacancy (e.g. 5%). Reduces rent in cash flow calculations.
          </p>
        </div>

          </div>
        </section>

        <section
          id="section-notes"
          tabIndex={-1}
          className="scroll-mt-28"
          aria-labelledby="heading-edit-notes"
        >
          <h2 id="heading-edit-notes" className="text-xl font-semibold text-foreground">
            Notes
          </h2>
          <p className="mt-1 text-sm text-muted">Optional context for your portfolio (not required for calculations).</p>
          <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="notes" className={labelClass}>
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={values.notes}
            className={inputClass}
          />
        </div>
          </div>
        </section>
      </div>

      <div className="mt-10 flex gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50"
        >
          {submitting ? "Saving…" : isEdit ? "Save changes" : "Create property"}
        </button>
        <Link
          href={isEdit ? `/properties/${property.id}` : "/properties"}
          className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium transition-colors duration-150 hover:bg-subtle"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
