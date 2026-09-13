# TJFit launch gate — 8 September 2026

Result: NOT READY FOR PRODUCTION PURCHASES. This is an interim gate, not a complete security audit.

## Applied changes

- Removed the glowing top scroll-progress decoration and replaced gradient scrollbar styling with a neutral thumb.
- Existing Lenis now handles anchor navigation and excludes dialog/form scrollers. Back-to-top uses Lenis when available, respects reduced motion and is not keyboard-focusable while hidden.
- Equipment-store visitors no longer receive the account-choice popup. Blocked local storage no longer throws from the guest-popup effect.
- Simulated checkout requires explicit test-provider selection and is forbidden in production. Unknown provider names fail closed instead of falling back to simulated payment.
- Corrected misleading webhook comments that claimed Gumroad pings carried authenticated HMAC timestamps. No webhook authentication behavior changed in that documentation correction.
- Applied compatible dependency updates through npm audit fix without force or lifecycle scripts.

## Evidence

- Baseline: 435 tests, typecheck and lint passed.
- After executable changes/dependency updates: 438 tests across 44 files, typecheck and lint passed.
- Production-only npm audit: before 10 findings (6 high, 2 moderate, 2 low); after 3 findings (Next.js high, bundled PostCSS high, esbuild low). This does not include every development-only finding and is not proof of exploitability or runtime safety.
- Production build compiles but fails prerendering. Log contains missing NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY, missing LLM/email configuration warnings, and a separate undefined-call prerender failure. The precise cause of the latter is unresolved; inspect in an isolated build environment before attributing it to source changes.
- Browser verification of the new scrolling behavior is still required. Previous accessory enquiry browser checks do not cover it.

## Open payment findings to resolve

- Gumroad webhook inserts its deduplication record before authoritative sale retrieval; a failed retrieval is later deduplicated on retry. Verify with route-level tests and repair retry/claim semantics before declaring fulfilment reliable.
- A five-minute untrusted sale-timestamp cutoff can reject delayed legitimate events. Reassess this policy together with verified-sale checks and durable idempotency; the timestamp is not an authentication boundary.
- Review non-sale webhook handlers for authoritative validation before changing customer entitlements.
- Actual Gumroad account/payout standing is unverified; user has been asked to sign in. No test charge performed.

## Store and deployment work outstanding

Shopify live admin shows Türkiye as the sole active market and no configured payment provider. shop.tjfit.org was added to Shopify and its CNAME saved in Namecheap; Shopify confirmed DNS and was provisioning TLS at the latest check. Primary-domain switch, HTTPS verification and application link update remain to be completed after provisioning. Existing root, www and mail records were not edited.

Broad product sourcing/competitor comparisons, supplier qualification, checkout activation, owner-package costs, seller/payment eligibility, full runtime verification and deployment are not complete. PR remains draft. Do not represent a candidate supplier, passing unit suite or domain connection as a ready-to-pay store.
