import { isLocale } from "@/lib/i18n";

export default function PrivacyPolicyPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
      <span className="badge">Privacy Policy</span>
      <h1 className="text-4xl font-semibold text-white">Privacy Policy</h1>
      <p className="text-sm leading-7 text-zinc-300">
        TJFit collects account details, progress data, and service activity required to provide coaching and
        program services. We use this information to operate accounts, improve platform quality, and support users.
      </p>
      <p className="text-sm leading-7 text-zinc-300">
        Payment processing is handled by third-party payment providers. We do not store full payment card details
        on TJFit servers. We apply reasonable security measures to protect personal information.
      </p>
      <p className="text-sm leading-7 text-zinc-300">
        You can request access, correction, or deletion of your personal data by contacting support.
      </p>
      <p className="text-sm text-zinc-500">Last updated: 2026-03-29</p>
    </div>
  );
}

