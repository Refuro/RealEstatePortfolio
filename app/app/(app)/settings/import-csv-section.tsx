"use client";

import { useState, useRef } from "react";
import Link from "next/link";

type ImportResult = {
  imported: number;
  errors: { row: number; message: string }[];
  code?: string;
};

type ImportRow = {
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  nickname: string | null;
};

type RequiresSelection = {
  validRows: ImportRow[];
  slotsRemaining: number;
  limit: number;
  validationErrors: { row: number; message: string }[];
};

function formatRowLabel(row: ImportRow): string {
  if (row.nickname?.trim()) return row.nickname.trim();
  const parts = [row.addressLine1, row.city, row.state, row.zipCode].filter(Boolean);
  return parts.join(", ");
}

export function ImportCsvSection() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [requiresSelection, setRequiresSelection] = useState<RequiresSelection | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleDownloadTemplate() {
    try {
      const res = await fetch("/api/import/portfolio/template");
      if (!res.ok) throw new Error("Failed to download");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "portfolio-import-template.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silent fail
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setRequiresSelection(null);
    setSelectedIndices(new Set());
    setPendingFile(file);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/import/portfolio", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as ImportResult & {
        error?: string;
        code?: string;
        requiresSelection?: boolean;
        validRows?: ImportRow[];
        slotsRemaining?: number;
        limit?: number;
        validationErrors?: { row: number; message: string }[];
      };
      if (!res.ok) {
        const errors =
          json.errors?.length ? json.errors : [{ row: 0, message: json.error ?? "Import failed" }];
        setResult({
          imported: 0,
          errors,
          code: json.code,
        });
        setPendingFile(null);
      } else if (json.requiresSelection && json.validRows && json.slotsRemaining != null) {
        setRequiresSelection({
          validRows: json.validRows,
          slotsRemaining: json.slotsRemaining,
          limit: json.limit ?? 0,
          validationErrors: json.validationErrors ?? [],
        });
      } else {
        setResult({ imported: json.imported, errors: json.errors ?? [] });
        setPendingFile(null);
      }
    } catch {
      setResult({
        imported: 0,
        errors: [{ row: 0, message: "Import failed" }],
      });
      setPendingFile(null);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  async function handleImportSelected() {
    if (!pendingFile || requiresSelection == null) return;
    const indices = Array.from(selectedIndices).sort((a, b) => a - b);
    if (indices.length === 0) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("file", pendingFile);
      formData.set("selectedIndices", indices.join(","));
      const res = await fetch("/api/import/portfolio", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as ImportResult & { error?: string };
      if (!res.ok) {
        setResult({
          imported: 0,
          errors: [{ row: 0, message: json.error ?? "Import failed" }],
        });
      } else {
        setResult({ imported: json.imported, errors: json.errors ?? [] });
      }
      setRequiresSelection(null);
      setSelectedIndices(new Set());
      setPendingFile(null);
    } catch {
      setResult({
        imported: 0,
        errors: [{ row: 0, message: "Import failed" }],
      });
    } finally {
      setLoading(false);
    }
  }

  function toggleSelection(index: number) {
    if (requiresSelection == null) return;
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else if (next.size < requiresSelection.slotsRemaining) {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-base text-muted">
        Import properties from a CSV file. Use the template to ensure correct format.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          disabled={loading}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-subtle disabled:opacity-50"
        >
          {loading ? "Importing…" : "Import from CSV"}
        </button>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="text-sm font-medium text-accent hover:underline"
        >
          Download template
        </button>
      </div>

      {requiresSelection && (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <p className="text-base text-foreground">
            Your file has {requiresSelection.validRows.length} properties. Your plan allows{" "}
            {requiresSelection.slotsRemaining}. Choose which to import:
          </p>
          {requiresSelection.validationErrors.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted mb-2">Validation errors (skipped rows):</p>
              <ul className="space-y-1 text-sm text-muted">
                {requiresSelection.validationErrors.map((err, i) => (
                  <li key={i}>
                    {err.row > 0 ? `Row ${err.row}: ` : ""}
                    {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-2">
            {requiresSelection.validRows.map((row, index) => (
              <label
                key={index}
                className={`flex items-center gap-3 rounded-md border border-border px-4 py-3 cursor-pointer transition hover:bg-subtle ${
                  selectedIndices.has(index) ? "bg-subtle/50" : ""
                } ${selectedIndices.size >= requiresSelection.slotsRemaining && !selectedIndices.has(index) ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selectedIndices.has(index)}
                  onChange={() => toggleSelection(index)}
                  disabled={
                    selectedIndices.size >= requiresSelection.slotsRemaining && !selectedIndices.has(index)
                  }
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent/20"
                />
                <span className="text-base text-foreground">{formatRowLabel(row)}</span>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={handleImportSelected}
              disabled={loading || selectedIndices.size === 0}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "Importing…" : "Import selected"}
            </button>
            <Link
              href="/plans"
              className="text-base font-medium text-accent hover:underline"
            >
              Upgrade to import all
            </Link>
          </div>
        </div>
      )}

      {result && !requiresSelection && (
        <div className="rounded-md border border-border bg-subtle/50 p-4">
          <p className="text-base font-medium text-foreground">
            {result.imported} imported
            {result.errors.length > 0 && `, ${result.errors.length} error(s)`}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {result.errors.map((err, i) => (
                <li key={i}>
                  {err.row > 0 ? `Row ${err.row}: ` : ""}
                  {err.message}
                  {(result.code === "PLAN_LIMIT_REACHED" ||
                    err.message.toLowerCase().includes("limit")) && (
                    <>
                      {" "}
                      <Link href="/plans" className="font-medium text-accent hover:underline">
                        Upgrade plan
                      </Link>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
