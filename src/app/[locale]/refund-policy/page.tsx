import { isLocale } from "@/lib/i18n";

export default function RefundPolicyPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
      <span className="badge">Refund Policy</span>
      <h1 className="text-4xl font-semibold text-white">Refund Policy</h1>
      <p className="text-sm leading-7 text-zinc-300">
        Digital programs and coaching services may be refunded according to the service type and usage status.
        If a session is not delivered, users can request a refund or reschedule.
      </p>
      <p className="text-sm leading-7 text-zinc-300">
        Program purchases are generally non-refundable after significant content access, unless required by law
        or in cases of duplicate/failed charges.
      </p>
      <p className="text-sm leading-7 text-zinc-300">
        To request a refund, submit a request through the Feedback & Support page with your order reference and
        account email. Requests are reviewed within 3-7 business days.
      </p>
      <p className="text-sm text-zinc-500">Last updated: 2026-03-29</p>
    </div>
  );
}

