"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  MortgageFormFields,
  defaultMortgageFormData,
  type MortgageFormData,
} from "./mortgage-form-fields";

function formatLoanType(loanType: string): string {
  const lower = loanType.replace(/_/g, " ").toLowerCase();
  const acronyms = ["fha", "va", "usda"];
  if (acronyms.includes(lower)) return lower.toUpperCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

type PayoffProjection = {
  payoffDate: string | null;
  remainingAtTermEnd: number | null;
};

type Mortgage = {
  id: string;
  originalLoanAmount: string;
  currentBalance: string;
  balanceAsOfDate?: string | null;
  interestRate: string;
  termYears: number;
  startDate: string;
  monthlyPayment: string;
  paymentEffectiveDate: string | null;
  escrowIncluded: boolean;
  escrowAmount?: string | null;
  lenderName: string | null;
  loanType: string | null;
  effectiveBalance?: number;
  balanceSource?: "stored" | "stored_projected" | "projected";
  payoffProjection?: PayoffProjection;
};

export function MortgageSection({
  propertyId,
  mortgages: initialMortgages,
  embedded,
}: {
  propertyId: string;
  mortgages: Mortgage[];
  embedded?: boolean;
}) {
  const router = useRouter();
  const [mortgages, setMortgages] = useState<Mortgage[]>(initialMortgages);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refreshMortgages() {
    fetch(`/api/properties/${propertyId}/mortgage`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMortgages(data);
      })
      .catch(() => {});
    router.refresh();
  }

  const Wrapper = embedded ? "div" : "section";
  const wrapperClassName = embedded ? "" : "rounded-lg border border-border bg-card p-4";

  return (
    <Wrapper className={wrapperClassName}>
      <div
        className={`flex items-center gap-2 ${embedded ? "justify-end" : "justify-between"}`}
      >
        {!embedded && (
          <h2 className="mb-0 text-xs font-semibold text-muted">
            Mortgages
          </h2>
        )}
        {!showForm && editingId === null && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-accent hover:underline"
          >
            {mortgages.length > 0 ? "Add another mortgage" : "Add mortgage"}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-md px-3 py-2 text-sm text-negative">
          {error}
        </div>
      )}

      {showForm && (
        <MortgageForm
          propertyId={propertyId}
          onSuccess={() => {
            setShowForm(false);
            setError(null);
            refreshMortgages();
          }}
          onCancel={() => {
            setShowForm(false);
            setError(null);
          }}
          setError={setError}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />
      )}

      {editingId && (
        <MortgageForm
          propertyId={propertyId}
          mortgageId={editingId}
          mortgage={mortgages.find((m) => m.id === editingId) ?? undefined}
          onSuccess={() => {
            setEditingId(null);
            setError(null);
            refreshMortgages();
          }}
          onCancel={() => {
            setEditingId(null);
            setError(null);
          }}
          setError={setError}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />
      )}

      {!showForm && !editingId && mortgages.length === 0 && (
        <div className="mt-4 rounded-md border border-dashed border-border bg-subtle/50 p-4 text-center">
          <p className="text-sm text-muted">No mortgage on file.</p>
          <p className="mt-1 text-xs text-muted">
            Add a mortgage to see equity, LTV, payoff timeline, and amortization.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Add mortgage
          </button>
        </div>
      )}

      {!showForm && !editingId && mortgages.length > 0 && (
        <>
        <ul className="mt-4 space-y-4">
          {mortgages.map((m) => (
            <li
              key={m.id}
              className="rounded-md border border-border bg-subtle/50 p-4"
            >
              <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted">
                    {m.balanceSource === "stored" ? "Balance" : "Est. balance"}
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    ${(m.effectiveBalance ?? Number(m.currentBalance)).toLocaleString()}
                    {m.balanceSource === "stored" && m.balanceAsOfDate ? (
                      <span className="ml-1 text-xs text-muted font-normal">
                        (as of {new Date(m.balanceAsOfDate).toLocaleDateString()})
                      </span>
                    ) : m.balanceSource === "stored_projected" && m.balanceAsOfDate ? (
                      <span className="ml-1 block text-xs text-muted font-normal">
                        (est. from {new Date(m.balanceAsOfDate).toLocaleDateString()})
                      </span>
                    ) : m.balanceSource === "projected" ? (
                      <span className="ml-1 block text-xs text-muted font-normal">
                        (from amortization — update from your statement for accuracy)
                      </span>
                    ) : null}
                  </dd>
                  {m.balanceSource === "projected" && (
                    <p className="mt-0.5 text-xs text-muted">
                      Consider updating from your latest statement.
                    </p>
                  )}
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted">Rate</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {(Number(m.interestRate) * 100).toFixed(2)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted">Term</dt>
                  <dd className="text-sm font-medium text-foreground">{m.termYears} years</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted">Monthly payment</dt>
                  <dd className="text-sm font-medium text-foreground">
                    ${Number(m.monthlyPayment).toLocaleString()}
                    {m.paymentEffectiveDate && (
                      <span className="ml-1 text-xs text-muted font-normal">
                        (as of {new Date(m.paymentEffectiveDate).toLocaleDateString()})
                      </span>
                    )}
                  </dd>
                </div>
                {m.originalLoanAmount && (
                  <div>
                    <dt className="text-sm font-medium text-muted">Original loan amount</dt>
                    <dd className="text-sm font-medium text-foreground">
                      ${Number(m.originalLoanAmount).toLocaleString()}
                    </dd>
                  </div>
                )}
                {m.loanType && (
                  <div>
                    <dt className="text-sm font-medium text-muted">Loan type</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {formatLoanType(m.loanType)}
                    </dd>
                  </div>
                )}
                {m.startDate && (
                  <div>
                    <dt className="text-sm font-medium text-muted">Loan start date</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {new Date(m.startDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {m.lenderName && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-muted">Lender</dt>
                    <dd className="text-sm font-medium text-foreground">{m.lenderName}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(m.id)}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("Delete this mortgage?")) return;
                    const res = await fetch(
                      `/api/properties/${propertyId}/mortgage/${m.id}`,
                      { method: "DELETE" }
                    );
                    if (res.ok) refreshMortgages();
                  }}
                  className="text-sm font-medium text-negative hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        </>
      )}
    </Wrapper>
  );
}

type MortgageFormProps = {
  propertyId: string;
  mortgageId?: string;
  mortgage?: Mortgage;
  onSuccess: () => void;
  onCancel: () => void;
  setError: (e: string | null) => void;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
};

function mortgageFormDataFromMortgage(m: Mortgage): MortgageFormData {
  return {
    originalLoanAmount: m.originalLoanAmount,
    currentBalance: m.currentBalance,
    balanceAsOfDate: m.balanceAsOfDate ?? "",
    interestRatePercent: (Number(m.interestRate) * 100).toString(),
    termYears: m.termYears.toString(),
    startDate: m.startDate,
    monthlyPayment: m.monthlyPayment,
    paymentEffectiveDate: m.paymentEffectiveDate ?? "",
    escrowIncluded: m.escrowIncluded,
    escrowAmount: m.escrowAmount ?? "",
    lenderName: m.lenderName ?? "",
    loanType: m.loanType ?? "",
  };
}

function mortgageFormDataToPayload(data: MortgageFormData) {
  const interestDecimal = (Number(data.interestRatePercent) / 100).toString();
  return {
    originalLoanAmount: data.originalLoanAmount,
    currentBalance: data.currentBalance,
    balanceAsOfDate: data.balanceAsOfDate?.trim() ? data.balanceAsOfDate : null,
    interestRate: interestDecimal,
    termYears: Number(data.termYears),
    startDate: data.startDate,
    monthlyPayment: data.monthlyPayment,
    paymentEffectiveDate: data.paymentEffectiveDate?.trim() ? data.paymentEffectiveDate : null,
    escrowIncluded: data.escrowIncluded,
    escrowAmount: data.escrowAmount?.trim() ? data.escrowAmount : null,
    lenderName: data.lenderName.trim() || null,
    loanType: data.loanType.trim() || null,
  };
}

function MortgageForm({
  propertyId,
  mortgageId,
  mortgage,
  onSuccess,
  onCancel,
  setError,
  submitting,
  setSubmitting,
}: MortgageFormProps) {
  const isEdit = !!mortgageId && !!mortgage;
  const [formData, setFormData] = useState<MortgageFormData>(
    mortgage ? mortgageFormDataFromMortgage(mortgage) : defaultMortgageFormData
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const payload = mortgageFormDataToPayload(formData);

    try {
      if (isEdit) {
        const res = await fetch(
          `/api/properties/${propertyId}/mortgage/${mortgageId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Update failed");
          setSubmitting(false);
          return;
        }
      } else {
        const res = await fetch(`/api/properties/${propertyId}/mortgage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error || "Create failed");
          setSubmitting(false);
          return;
        }
      }
      onSuccess();
    } catch {
      setError("Network error");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-md border border-border bg-card p-4">
      <MortgageFormFields value={formData} onChange={setFormData} />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
        >
          {submitting ? "Saving…" : isEdit ? "Save" : "Add mortgage"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium hover:bg-subtle"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
