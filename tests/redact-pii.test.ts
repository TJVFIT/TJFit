/**
 * Pins the telemetry PII scrub (slophunter must-fix on b50053f: buyer email
 * flowed into Sentry's event title via sale.ts's "unable to resolve user
 * for <email>" handler error).
 */

import { describe, it, expect } from "vitest";

import { redactEmails, redactPiiDeep } from "@/lib/redact-pii";

describe("redactEmails", () => {
  it("scrubs the exact leaking handler-error shape", () => {
    const msg = "direct_purchase_user: unable to resolve user for buyer.name+tag@example.co.uk";
    expect(redactEmails(msg)).toBe("direct_purchase_user: unable to resolve user for [email redacted]");
  });

  it("scrubs multiple emails in one string", () => {
    expect(redactEmails("from a@b.io to c.d@e-f.com done")).toBe(
      "from [email redacted] to [email redacted] done"
    );
  });

  it("leaves email-free strings untouched", () => {
    const msg = "sale_not_found: sale G_123 missing after re-verify";
    expect(redactEmails(msg)).toBe(msg);
  });
});

describe("redactPiiDeep", () => {
  it("scrubs strings nested in objects and arrays (Sentry event shape)", () => {
    const event = {
      message: "unable to resolve user for x@y.com",
      contexts: {
        gumroad_webhook: { message: "user x@y.com missing", event_id: "e1" }
      },
      exception: { values: [{ value: "fetch failed for x@y.com", type: "Error" }] },
      tags: { surface: "gumroad-webhook" }
    };
    const out = redactPiiDeep(event);
    expect(out.message).toBe("unable to resolve user for [email redacted]");
    expect(out.contexts.gumroad_webhook.message).toBe("user [email redacted] missing");
    expect(out.contexts.gumroad_webhook.event_id).toBe("e1");
    expect(out.exception.values[0].value).toBe("fetch failed for [email redacted]");
    expect(out.tags.surface).toBe("gumroad-webhook");
  });

  it("passes through non-string primitives and null unchanged", () => {
    expect(redactPiiDeep({ n: 3, b: true, z: null, u: undefined })).toEqual({
      n: 3,
      b: true,
      z: null,
      u: undefined
    });
  });
});
