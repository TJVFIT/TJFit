"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

type FeedbackDict = Dictionary["feedback"];

const TYPES = [
  { value: "complaint", labelKey: "complaint" as const },
  { value: "suggestion", labelKey: "suggestion" as const },
  { value: "feedback", labelKey: "feedback" as const },
  { value: "help_request", labelKey: "helpRequest" as const },
  { value: "refund_request", labelKey: "refundRequest" as const }
] as const;

export function FeedbackForm({ dict, locale }: { dict: FeedbackDict; locale: Locale }) {
  const [type, setType] = useState<string>("feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderReference, setOrderReference] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subject: subject.trim() || null,
          message: message.trim(),
          order_reference: orderReference.trim() || null,
          email: email.trim() || null,
          locale
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[24px] border border-green-500/30 bg-green-500/10 p-6 text-center">
        <p className="text-lg font-medium text-green-400">{dict.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-zinc-300">{dict.typeLabel}</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="input mt-2"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {dict[t.labelKey]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300">{dict.subject}</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="input mt-2"
          placeholder={dict.subject}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300">{dict.message}</label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input mt-2 min-h-32"
          placeholder={dict.message}
        />
      </div>

      {type === "refund_request" && (
        <div>
          <label className="block text-sm font-medium text-zinc-300">{dict.orderReference}</label>
          <input
            type="text"
            value={orderReference}
            onChange={(e) => setOrderReference(e.target.value)}
            className="input mt-2"
            placeholder={dict.orderReference}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-zinc-300">{dict.email}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input mt-2"
          placeholder={dict.email}
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !message.trim()}
        className="gradient-button w-full rounded-full px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? "..." : dict.submit}
      </button>
    </form>
  );
}
