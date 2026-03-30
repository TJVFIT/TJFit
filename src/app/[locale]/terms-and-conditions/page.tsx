import { isLocale } from "@/lib/i18n";
import { BILLING_PROVIDER, TERMS_VERSION } from "@/lib/legal";

export default function TermsPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
      <span className="badge">Terms of Service</span>
      <h1 className="text-4xl font-semibold text-white">Terms and Conditions</h1>
      <section className="space-y-3 rounded-[24px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
        <p className="text-sm leading-7 text-zinc-300">
          By creating an account or using TJFit, you agree to these Terms, our Privacy Policy, and our Refund Policy.
          If you do not agree, you must not use the platform.
        </p>
      </section>
      <section className="space-y-3 rounded-[24px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">2. Eligibility and Account Security</h2>
        <p className="text-sm leading-7 text-zinc-300">
          You must provide accurate information, keep your login credentials secure, and be responsible for activity
          under your account. TJFit may suspend accounts used for fraud, abuse, or unlawful activity.
        </p>
      </section>
      <section className="space-y-3 rounded-[24px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">3. Health and Medical Disclaimer</h2>
        <p className="text-sm leading-7 text-zinc-300">
          TJFit provides education and coaching, not medical diagnosis or treatment. Results vary by consistency,
          health status, and adherence. Consult a licensed medical professional before starting any program.
        </p>
      </section>
      <section className="space-y-3 rounded-[24px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">4. Payments and Billing ({BILLING_PROVIDER})</h2>
        <p className="text-sm leading-7 text-zinc-300">
          Payments for paid products may be processed by {BILLING_PROVIDER}. By purchasing, you authorize charges
          through the selected payment method and agree to applicable taxes, billing, and charge handling rules.
        </p>
        <p className="text-sm leading-7 text-zinc-300">
          Pricing, refunds, and cancellations are governed by the checkout terms and TJFit refund policy shown at the
          time of purchase.
        </p>
      </section>
      <section className="space-y-3 rounded-[24px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">5. Acceptable Use</h2>
        <p className="text-sm leading-7 text-zinc-300">
          You may not reverse engineer, scrape, abuse, harass, upload unlawful content, or interfere with platform
          security. Violations may lead to suspension or permanent termination.
        </p>
      </section>
      <section className="space-y-3 rounded-[24px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">6. Limitation of Liability</h2>
        <p className="text-sm leading-7 text-zinc-300">
          To the maximum extent permitted by law, TJFit is not liable for indirect, incidental, special, or
          consequential damages. Use the platform at your own risk.
        </p>
      </section>
      <section className="space-y-3 rounded-[24px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-semibold text-white">7. Updates to Terms</h2>
        <p className="text-sm leading-7 text-zinc-300">
          We may update these Terms from time to time. Continued use after updates means you accept the revised
          version.
        </p>
      </section>
      <p className="text-sm text-zinc-500">Terms version: {TERMS_VERSION}</p>
    </div>
  );
}

