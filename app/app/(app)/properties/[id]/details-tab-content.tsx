"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPropertyType } from "@/lib/property-utils";
import { formatTimeAgo, isDataStale } from "@/lib/date-utils";
import { isBenchmarkFresh } from "@/lib/benchmark-utils";
import { getPiForAmortization } from "@/lib/amortization";
import { formatCurrency } from "@/lib/format-currency";
import { MortgageSection } from "../mortgage-section";
import type { MortgageForTabs } from "./property-detail-tabs";

type MortgageWithBalanceSource = MortgageForTabs & {
  balanceAsOfDate?: string | null;
};

function Chip({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "warn" | "good" }) {
  const toneClass =
    tone === "good"
      ? "border-positive/30 text-positive"
      : tone === "warn"
        ? "border-negative/30 text-negative"
        : "border-border text-muted";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${toneClass}`}>
      {label}
    </span>
  );
}

export function DetailsTabContent({
  propertyId,
  property,
  address,
  totalRent,
  mortgageData,
}: {
  propertyId: string;
  property: {
    nickname: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    zipCode: string;
    propertyType: string;
    units: number;
    bedrooms: number | null;
    bathrooms: number | null;
    unitMix: string | null;
    purchasePrice: number;
    purchaseDate: Date | string;
    currentEstimatedValue: number;
    currentMonthlyExpenses: number;
    unitRents: number[] | null;
    ownershipPercent: number | null;
    vacancyPercent: number | null;
    cashInvested: number | null;
    notes: string | null;
    marketRent: number | null;
    marketRentAsOf: Date | string | null;
    updatedAt: Date | string;
  };
  address: string;
  totalRent: number;
  mortgageData: MortgageWithBalanceSource[];
}) {
  const router = useRouter();
  const mortgageDataForSection = mortgageData.map((m) => ({
    ...m,
    balanceAsOfDate: m.balanceAsOfDate ?? null,
    paymentEffectiveDate: m.paymentEffectiveDate ?? null,
    escrowIncluded: m.escrowIncluded ?? false,
  }));

  const staleProperty = isDataStale(new Date(property.updatedAt));
  const benchmarkMissing = property.marketRent == null || property.marketRent <= 0;
  const benchmarkStale =
    !benchmarkMissing && !isBenchmarkFresh(property.marketRentAsOf ?? null);
  const missingLenderCount = mortgageData.filter((m) => !m.lenderName).length;
  const potentialNegAmCount = mortgageData.filter((m) => {
    const balance = m.effectiveBalance ?? Number(m.currentBalance);
    const piPayment = getPiForAmortization({
      originalLoanAmount: Number(m.originalLoanAmount),
      currentBalance: balance,
      interestRate: Number(m.interestRate),
      termYears: m.termYears,
      startDate: m.startDate,
      monthlyPayment: Number(m.monthlyPayment),
      balanceAsOfDate: m.balanceAsOfDate ?? null,
      escrowIncluded: Boolean(m.escrowIncluded),
      escrowAmount: m.escrowAmount != null ? Number(m.escrowAmount) : null,
    });
    const monthlyInterest = balance * Number(m.interestRate) / 12;
    return piPayment <= monthlyInterest;
  }).length;

  const detailsSummary = [
    property.bedrooms != null && `${property.bedrooms} bed`,
    property.bathrooms != null && `${Number(property.bathrooms)} bath`,
    property.unitMix && property.unitMix,
  ]
    .filter(Boolean)
    .join(" · ");

  const [editingFacts, setEditingFacts] = useState(false);
  const [editingFinancial, setEditingFinancial] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [factsError, setFactsError] = useState<string | null>(null);
  const [financialError, setFinancialError] = useState<string | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [savingFacts, setSavingFacts] = useState(false);
  const [savingFinancial, setSavingFinancial] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  const factsInitial = {
    addressLine1: property.addressLine1 ?? "",
    addressLine2: property.addressLine2 ?? "",
    city: property.city ?? "",
    state: property.state ?? "",
    zipCode: property.zipCode ?? "",
    purchaseDate: new Date(property.purchaseDate).toISOString().slice(0, 10),
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : "",
    bathrooms: property.bathrooms != null ? String(property.bathrooms) : "",
    unitMix: property.unitMix ?? "",
  };

  const [factsForm, setFactsForm] = useState(() => ({
    ...factsInitial,
  }));

  const financialInitial = {
    purchasePrice: String(Number(property.purchasePrice) || 0),
    currentEstimatedValue: String(Number(property.currentEstimatedValue) || 0),
    currentMonthlyExpenses: String(Number(property.currentMonthlyExpenses) || 0),
    ownershipPercent: String(property.ownershipPercent ?? 100),
    vacancyPercent: String(property.vacancyPercent ?? 5),
    cashInvested: property.cashInvested != null ? String(property.cashInvested) : "",
  };

  const [financialForm, setFinancialForm] = useState(() => ({
    ...financialInitial,
  }));

  const [notesForm, setNotesForm] = useState(property.notes ?? "");
  const notesInitial = property.notes ?? "";

  const factsDirty =
    factsForm.addressLine1 !== factsInitial.addressLine1 ||
    factsForm.addressLine2 !== factsInitial.addressLine2 ||
    factsForm.city !== factsInitial.city ||
    factsForm.state !== factsInitial.state ||
    factsForm.zipCode !== factsInitial.zipCode ||
    factsForm.purchaseDate !== factsInitial.purchaseDate ||
    factsForm.bedrooms !== factsInitial.bedrooms ||
    factsForm.bathrooms !== factsInitial.bathrooms ||
    factsForm.unitMix !== factsInitial.unitMix;

  const financialDirty =
    financialForm.purchasePrice !== financialInitial.purchasePrice ||
    financialForm.currentEstimatedValue !== financialInitial.currentEstimatedValue ||
    financialForm.currentMonthlyExpenses !== financialInitial.currentMonthlyExpenses ||
    financialForm.ownershipPercent !== financialInitial.ownershipPercent ||
    financialForm.vacancyPercent !== financialInitial.vacancyPercent ||
    financialForm.cashInvested !== financialInitial.cashInvested;

  const notesDirty = notesForm !== notesInitial;

  async function patchProperty(payload: Record<string, unknown>) {
    const res = await fetch(`/api/properties/${propertyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as { error?: string; details?: unknown };
    if (!res.ok) {
      throw new Error(json.error ?? "Failed to update property");
    }
    router.refresh();
  }

  function resetFactsForm() {
    setFactsForm({ ...factsInitial });
  }

  function resetFinancialForm() {
    setFinancialForm({ ...financialInitial });
  }

  function handleFactsCancel() {
    if (factsDirty && !window.confirm("Discard unsaved Property facts changes?")) return;
    setEditingFacts(false);
    resetFactsForm();
    setFactsError(null);
  }

  function handleFinancialCancel() {
    if (financialDirty && !window.confirm("Discard unsaved Financial inputs changes?")) return;
    setEditingFinancial(false);
    resetFinancialForm();
    setFinancialError(null);
  }

  function handleNotesCancel() {
    if (notesDirty && !window.confirm("Discard unsaved Notes changes?")) return;
    setEditingNotes(false);
    setNotesForm(notesInitial);
    setNotesError(null);
  }

  async function saveFacts() {
    setSavingFacts(true);
    setFactsError(null);
    try {
      await patchProperty({
        addressLine1: factsForm.addressLine1,
        addressLine2: factsForm.addressLine2 || null,
        city: factsForm.city,
        state: factsForm.state,
        zipCode: factsForm.zipCode,
        purchaseDate: factsForm.purchaseDate,
        bedrooms: factsForm.bedrooms ? Number(factsForm.bedrooms) : null,
        bathrooms: factsForm.bathrooms ? Number(factsForm.bathrooms) : null,
        unitMix: factsForm.unitMix || null,
      });
      setEditingFacts(false);
    } catch (err) {
      setFactsError(err instanceof Error ? err.message : "Unable to save changes.");
    } finally {
      setSavingFacts(false);
    }
  }

  async function saveFinancial() {
    setSavingFinancial(true);
    setFinancialError(null);
    try {
      await patchProperty({
        purchasePrice: financialForm.purchasePrice,
        currentEstimatedValue: financialForm.currentEstimatedValue,
        currentMonthlyExpenses: financialForm.currentMonthlyExpenses,
        ownershipPercent: Number(financialForm.ownershipPercent),
        vacancyPercent: Number(financialForm.vacancyPercent),
        cashInvested: financialForm.cashInvested || null,
      });
      setEditingFinancial(false);
    } catch (err) {
      setFinancialError(err instanceof Error ? err.message : "Unable to save changes.");
    } finally {
      setSavingFinancial(false);
    }
  }

  async function saveNotes() {
    setSavingNotes(true);
    setNotesError(null);
    try {
      await patchProperty({ notes: notesForm || null });
      setEditingNotes(false);
    } catch (err) {
      setNotesError(err instanceof Error ? err.message : "Unable to save notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Data & settings
        </h2>
        <Link
          href={`/properties/${propertyId}/edit`}
          className="text-sm font-medium text-accent hover:underline"
        >
          Edit property
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs text-muted">Last updated {formatTimeAgo(new Date(property.updatedAt))}</p>
        <div className="flex flex-wrap gap-2">
          {staleProperty ? (
            <Chip label="Property data stale" tone="warn" />
          ) : (
            <Chip label="Property data fresh" tone="good" />
          )}
          {benchmarkMissing ? (
            <Chip label="Benchmark missing" tone="warn" />
          ) : benchmarkStale ? (
            <Chip label="Benchmark stale" tone="warn" />
          ) : (
            <Chip label="Benchmark fresh" tone="good" />
          )}
          {missingLenderCount > 0 && (
            <Chip label={`${missingLenderCount} mortgage${missingLenderCount > 1 ? "s" : ""} missing lender`} tone="warn" />
          )}
          {potentialNegAmCount > 0 && (
            <Chip
              label={`${potentialNegAmCount} potential negative-amortization risk`}
              tone="warn"
            />
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Property facts</h3>
            {!editingFacts ? (
              <button
                type="button"
                onClick={() => {
                  resetFactsForm();
                  setFactsError(null);
                  setEditingFacts(true);
                }}
                className="text-xs font-medium text-accent hover:underline"
              >
                Edit
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleFactsCancel}
                  className="text-xs font-medium text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="property-facts-form"
                  disabled={savingFacts}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground disabled:opacity-60"
                >
                  {savingFacts ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
          {factsError && <p className="mt-2 text-xs text-negative">{factsError}</p>}
          {!editingFacts ? (
            <dl className="mt-3 space-y-3">
              <div>
                <dt className="text-sm font-medium text-muted">Address</dt>
                <dd className="text-sm font-medium text-foreground">{address || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted">Property type</dt>
                <dd className="text-sm font-medium text-foreground">
                  {formatPropertyType(property.propertyType, property.units)}
                </dd>
              </div>
              {detailsSummary && (
                <div>
                  <dt className="text-sm font-medium text-muted">Details</dt>
                  <dd className="text-sm font-medium text-foreground">{detailsSummary}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted">Purchase date</dt>
                <dd className="text-sm font-medium text-foreground">
                  {new Date(property.purchaseDate).toISOString().slice(0, 10)}
                </dd>
              </div>
            </dl>
          ) : (
            <form
              id="property-facts-form"
              className="mt-3 grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                void saveFacts();
              }}
            >
              <label className="text-xs font-medium text-muted">
                Address line 1
                <input
                  value={factsForm.addressLine1}
                  onChange={(e) => setFactsForm((p) => ({ ...p, addressLine1: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-base text-foreground"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                Address line 2
                <input
                  value={factsForm.addressLine2}
                  onChange={(e) => setFactsForm((p) => ({ ...p, addressLine2: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-base text-foreground"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                City
                <input
                  value={factsForm.city}
                  onChange={(e) => setFactsForm((p) => ({ ...p, city: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-base text-foreground"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                State
                <input
                  value={factsForm.state}
                  onChange={(e) => setFactsForm((p) => ({ ...p, state: e.target.value.toUpperCase() }))}
                  maxLength={2}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-base text-foreground"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                ZIP
                <input
                  value={factsForm.zipCode}
                  onChange={(e) => setFactsForm((p) => ({ ...p, zipCode: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-base text-foreground"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                Purchase date
                <input
                  type="date"
                  value={factsForm.purchaseDate}
                  onChange={(e) => setFactsForm((p) => ({ ...p, purchaseDate: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-base text-foreground"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                Bedrooms
                <input
                  type="number"
                  min={1}
                  value={factsForm.bedrooms}
                  onChange={(e) => setFactsForm((p) => ({ ...p, bedrooms: e.target.value }))}
                  inputMode="numeric"
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-base text-foreground"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                Bathrooms
                <input
                  type="number"
                  step={0.5}
                  min={0.5}
                  value={factsForm.bathrooms}
                  onChange={(e) => setFactsForm((p) => ({ ...p, bathrooms: e.target.value }))}
                  inputMode="decimal"
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-base text-foreground"
                />
              </label>
              <label className="text-xs font-medium text-muted sm:col-span-2">
                Unit mix
                <input
                  value={factsForm.unitMix}
                  onChange={(e) => setFactsForm((p) => ({ ...p, unitMix: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-base text-foreground"
                />
              </label>
            </form>
          )}
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Financial inputs</h3>
            {!editingFinancial ? (
              <button
                type="button"
                onClick={() => {
                  resetFinancialForm();
                  setFinancialError(null);
                  setEditingFinancial(true);
                }}
                className="text-xs font-medium text-accent hover:underline"
              >
                Edit
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleFinancialCancel}
                  className="text-xs font-medium text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="financial-inputs-form"
                  disabled={savingFinancial}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground disabled:opacity-60"
                >
                  {savingFinancial ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
          {financialError && <p className="mt-2 text-xs text-negative">{financialError}</p>}
          {!editingFinancial ? (
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted">Purchase price</dt>
                <dd className="text-sm font-medium text-foreground">{formatCurrency(Number(property.purchasePrice))}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted">Current estimated value</dt>
                <dd className="text-sm font-medium text-foreground">{formatCurrency(Number(property.currentEstimatedValue))}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-muted">Monthly rent</dt>
                <dd className="text-sm font-medium text-foreground">
                  {Array.isArray(property.unitRents) && (property.unitRents as number[]).length > 1 ? (
                    <>
                      {(property.unitRents as number[]).map((r, i) => (
                        <span key={i}>
                          {i > 0 && ", "}Unit {i + 1}: {formatCurrency(Number(r))}
                        </span>
                      ))}{" "}
                      <span className="text-muted">(Total: {formatCurrency(totalRent)})</span>
                    </>
                  ) : Array.isArray(property.unitRents) && (property.unitRents as number[]).length === 1 ? (
                    formatCurrency(Number((property.unitRents as number[])[0]))
                  ) : (
                    formatCurrency(totalRent)
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted">Monthly expenses</dt>
                <dd className="text-sm font-medium text-foreground">
                  {formatCurrency(Number(property.currentMonthlyExpenses))}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted">Ownership</dt>
                <dd className="text-sm font-medium text-foreground">
                  {property.ownershipPercent != null ? `${property.ownershipPercent}%` : "100%"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted">Vacancy</dt>
                <dd className="text-sm font-medium text-foreground">
                  {property.vacancyPercent != null ? `${property.vacancyPercent}%` : "5%"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted">Cash invested</dt>
                <dd className="text-sm font-medium text-foreground">
                  {property.cashInvested != null ? formatCurrency(Number(property.cashInvested)) : "—"}
                </dd>
              </div>
            </dl>
          ) : (
            <form
              id="financial-inputs-form"
              className="mt-3 grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                void saveFinancial();
              }}
            >
              <label className="text-xs font-medium text-muted">
                Purchase price
                <input
                  value={financialForm.purchasePrice}
                  onChange={(e) => setFinancialForm((p) => ({ ...p, purchasePrice: e.target.value }))}
                  inputMode="decimal"
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-base text-foreground"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                Current estimated value
                <input
                  value={financialForm.currentEstimatedValue}
                  onChange={(e) => setFinancialForm((p) => ({ ...p, currentEstimatedValue: e.target.value }))}
                  inputMode="decimal"
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-base text-foreground"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                Monthly expenses
                <input
                  value={financialForm.currentMonthlyExpenses}
                  onChange={(e) => setFinancialForm((p) => ({ ...p, currentMonthlyExpenses: e.target.value }))}
                  inputMode="decimal"
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-base text-foreground"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                Ownership (%)
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={financialForm.ownershipPercent}
                  onChange={(e) => setFinancialForm((p) => ({ ...p, ownershipPercent: e.target.value }))}
                  inputMode="numeric"
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-base text-foreground"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                Vacancy (%)
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={financialForm.vacancyPercent}
                  onChange={(e) => setFinancialForm((p) => ({ ...p, vacancyPercent: e.target.value }))}
                  inputMode="numeric"
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-base text-foreground"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                Cash invested
                <input
                  value={financialForm.cashInvested}
                  onChange={(e) => setFinancialForm((p) => ({ ...p, cashInvested: e.target.value }))}
                  inputMode="decimal"
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-base text-foreground"
                />
              </label>
            </form>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Notes</h3>
            {!editingNotes ? (
              <button
                type="button"
                onClick={() => {
                  setNotesForm(property.notes ?? "");
                  setNotesError(null);
                  setEditingNotes(true);
                }}
                className="text-xs font-medium text-accent hover:underline"
              >
                Edit
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleNotesCancel}
                  className="text-xs font-medium text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="notes-form"
                  disabled={savingNotes}
                  className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground disabled:opacity-60"
                >
                  {savingNotes ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
          {notesError && <p className="mt-2 text-xs text-negative">{notesError}</p>}
          {!editingNotes ? (
            <p className="mt-2 text-sm text-muted whitespace-pre-wrap">{property.notes || "—"}</p>
          ) : (
            <form
              id="notes-form"
              className="mt-2"
              onSubmit={(e) => {
                e.preventDefault();
                void saveNotes();
              }}
            >
              <textarea
                value={notesForm}
                onChange={(e) => setNotesForm(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    void saveNotes();
                  }
                }}
                rows={4}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-base text-foreground"
                placeholder="Add notes..."
              />
              <p className="mt-2 text-xs text-muted">Tip: press Ctrl+Enter (or Cmd+Enter) to save notes.</p>
            </form>
          )}
        </section>

      <div id="mortgages" className="scroll-mt-20">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Mortgage terms</h3>
          <Link
            href={`/mortgage?propertyId=${encodeURIComponent(propertyId)}`}
            className="text-xs font-medium text-accent hover:underline"
          >
            Open Mortgage workspace
          </Link>
        </div>
        <MortgageSection
          propertyId={propertyId}
          mortgages={mortgageDataForSection}
          embedded={false}
        />
      </div>
    </div>
  );
}
