"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

const SUBJECT_OPTIONS = [
  { value: "general", label: "General" },
  { value: "billing", label: "Billing" },
  { value: "bug_report", label: "Bug report" },
  { value: "feature_request", label: "Feature request" },
  { value: "other", label: "Other" },
] as const;

export function ContactForm() {
  const { user } = useUser();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const prefillEmail =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const website = formData.get("website") as string; // honeypot

    if (website) {
      setStatus("success");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="contact-email"
          className="block text-sm font-medium text-muted"
        >
          Email <span className="text-negative">*</span>
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          defaultValue={prefillEmail}
          autoComplete="email"
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-accent/20"
          disabled={status === "loading"}
        />
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="block text-sm font-medium text-muted"
        >
          Subject <span className="text-negative">*</span>
        </label>
        <select
          id="contact-subject"
          name="subject"
          required
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-accent/20"
          disabled={status === "loading"}
        >
          {SUBJECT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-medium text-muted"
        >
          Message <span className="text-negative">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-accent/20"
          disabled={status === "loading"}
        />
      </div>

      {/* Honeypot - hidden from users, bots fill it */}
      <div className="absolute -left-[9999px] top-0" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-negative">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>

      {status === "success" && (
        <p className="text-sm text-positive">
          Your message has been sent. We&apos;ll get back to you soon.
        </p>
      )}
    </form>
  );
}
