import { isLocale } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

const totalPayment = 1000;
const platformFee = 500;
const coachEarnings = 500;

export default function CheckoutPage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 xl:grid-cols-[1fr_0.9fr]">
        <section className="glass-panel rounded-[36px] p-8">
          <span className="badge">Checkout</span>
          <h1 className="mt-6 text-4xl font-semibold text-white">PayTR-powered premium checkout.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            User selects a session, chooses a time slot, enters PayTR payment iframe, and receives a confirmed booking after callback verification.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <input className="input" placeholder="Full name" />
            <input className="input" placeholder="Email" />
            <input className="input" placeholder="Preferred session time" />
            <select className="input">
              <option>Book Video Session</option>
              <option>Book Voice Session</option>
              <option>Chat Coaching</option>
            </select>
          </div>

          <div className="mt-8 rounded-[28px] border border-dashed border-white/10 bg-black/30 p-8 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-zinc-500">PayTR iFrame Area</p>
            <p className="mt-4 text-lg text-zinc-300">API route creates payment token and embeds the secure checkout here.</p>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-panel rounded-[36px] p-6">
            <p className="text-lg font-semibold text-white">Booking summary</p>
            <div className="mt-6 space-y-4">
              {[
                ["Coach", "Layla Haddad"],
                ["Session", "Video Session"],
                ["Time slot", "Tuesday 18:30"],
                ["Currency", "TRY"]
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm text-zinc-300">
                  <span>{label}</span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[36px] p-6">
            <p className="text-lg font-semibold text-white">Commission system</p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-zinc-300">
                <span>Total payment</span>
                <span className="text-white">{formatCurrency(totalPayment)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-zinc-300">
                <span>Platform fee</span>
                <span className="text-white">{formatCurrency(platformFee)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-zinc-300">
                <span>Coach earnings</span>
                <span className="text-white">{formatCurrency(coachEarnings)}</span>
              </div>
            </div>

            <button className="gradient-button mt-8 w-full rounded-full px-5 py-3 text-sm font-medium text-white">
              Continue to PayTR
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
