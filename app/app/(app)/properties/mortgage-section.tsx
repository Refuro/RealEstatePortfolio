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

type Mortgage = {
  id: string;
  originalLoanAmount: string;
  currentBalance: string;
  interestRate: string;
  termYears: number;
  startDate: string;
  monthlyPayment: string;
  paymentEffectiveDate: string | null;
  escrowIncluded: boolean;
  lenderName: string | null;
  loanType: string | null;
};

export function MortgageSection({
  propertyId,
  mortgages: initialMortgages,
}: {
  propertyId: string;
  mortgages: Mortgage[];
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

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold uppercase tracking-wide text-muted mb-4">
          Mortgage
        </h2>
        {!showForm && editingId === null && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-base font-medium text-foreground hover:underline"
          >
            Add mortgage
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
        <div className="mt-4 rounded-md border border-dashed border-border bg-subtle/50 p-6 text-center">
          <p className="text-base text-muted">No mortgage on file.</p>
          <p className="mt-1 text-sm text-muted">
            Add a mortgage to see equity, LTV, and amortization.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-4 rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Add mortgage
          </button>
        </div>
      )}

      {!showForm && !editingId && mortgages.length > 0 && (
        <ul className="mt-4 space-y-4">
          {mortgages.map((m) => (
            <li
              key={m.id}
              className="rounded-md border border-border bg-subtle/50 p-5"
            >
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <dt className="text-base text-muted">Balance</dt>
                  <dd className="text-lg font-medium text-foreground">
                    ${Number(m.currentBalance).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-base text-muted">Rate</dt>
                  <dd className="text-lg font-medium text-foreground">
                    {(Number(m.interestRate) * 100).toFixed(2)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-base text-muted">Term</dt>
                  <dd className="text-lg font-medium text-foreground">{m.termYears} years</dd>
                </div>
                <div>
                  <dt className="text-base text-muted">Monthly payment</dt>
                  <dd className="text-lg font-medium text-foreground">
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
                    <dt className="text-base text-muted">Original loan amount</dt>
                    <dd className="text-lg font-medium text-foreground">
                      ${Number(m.originalLoanAmount).toLocaleString()}
                    </dd>
                  </div>
                )}
                {m.loanType && (
                  <div>
                    <dt className="text-base text-muted">Loan type</dt>
                    <dd className="text-lg font-medium text-foreground">
                      {formatLoanType(m.loanType)}
                    </dd>
                  </div>
                )}
                {m.startDate && (
                  <div>
                    <dt className="text-base text-muted">Loan start date</dt>
                    <dd className="text-lg font-medium text-foreground">
                      {new Date(m.startDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {m.lenderName && (
                  <div className="col-span-2">
                    <dt className="text-base text-muted">Lender</dt>
                    <dd className="text-lg font-medium text-foreground">{m.lenderName}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingId(m.id)}
                  className="text-base font-medium text-muted hover:text-foreground hover:underline"
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
                  className="text-base font-medium text-negative hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
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
    interestRatePercent: (Number(m.interestRate) * 100).toString(),
    termYears: m.termYears.toString(),
    startDate: m.startDate,
    monthlyPayment: m.monthlyPayment,
    paymentEffectiveDate: m.paymentEffectiveDate ?? "",
    escrowIncluded: m.escrowIncluded,
    lenderName: m.lenderName ?? "",
    loanType: m.loanType ?? "",
  };
}

function mortgageFormDataToPayload(data: MortgageFormData) {
  const interestDecimal = (Number(data.interestRatePercent) / 100).toString();
  return {
    originalLoanAmount: data.originalLoanAmount,
    currentBalance: data.currentBalance,
    interestRate: interestDecimal,
    termYears: Number(data.termYears),
    startDate: data.startDate,
    monthlyPayment: data.monthlyPayment,
    paymentEffectiveDate: data.paymentEffectiveDate?.trim() ? data.paymentEffectiveDate : null,
    escrowIncluded: data.escrowIncluded,
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
