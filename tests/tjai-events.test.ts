/**
 * TJAI flywheel event instrumentation (TJFITV.10X PR8).
 * Privacy minimization: metadata is scalar-only, rows map fields correctly,
 * and recordTjaiEvent is fire-and-forget (never throws).
 */

import { describe, it, expect, vi } from "vitest";

import { recordTjaiEvent, sanitizeEventMetadata, toEventRow } from "@/lib/tjai/events";

describe("sanitizeEventMetadata", () => {
  it("keeps scalars and drops objects/arrays/functions", () => {
    const out = sanitizeEventMetadata({
      goal: "fat_loss",
      days: 4,
      ok: true,
      empty: null,
      nested: { a: 1 },
      list: [1, 2],
      fn: () => 1
    } as Record<string, unknown>);
    expect(out).toEqual({ goal: "fat_loss", days: 4, ok: true, empty: null });
  });

  it("returns an empty object for undefined", () => {
    expect(sanitizeEventMetadata(undefined)).toEqual({});
  });
});

describe("toEventRow", () => {
  it("maps camelCase event fields to snake_case columns with null defaults", () => {
    const row = toEventRow({
      event: "plan_generated",
      userId: "u1",
      planId: "p1",
      promptVersion: "2026.05.2",
      outcome: "success",
      metadata: { goal: "muscle_gain" }
    });
    expect(row.event).toBe("plan_generated");
    expect(row.user_id).toBe("u1");
    expect(row.plan_id).toBe("p1");
    expect(row.prompt_version).toBe("2026.05.2");
    expect(row.outcome).toBe("success");
    expect(row.conversation_id).toBeNull();
    expect(row.metadata).toEqual({ goal: "muscle_gain" });
  });

  it("strips non-scalar metadata at row build time", () => {
    const row = toEventRow({ event: "plan_generated", metadata: { nested: { x: 1 } } as unknown as Record<string, never> });
    expect(row.metadata).toEqual({});
  });
});

describe("recordTjaiEvent", () => {
  it("inserts the row and never throws when the insert rejects", () => {
    const insert = vi.fn().mockReturnValue(Promise.resolve({ error: { message: "boom" } }));
    const client = { from: vi.fn(() => ({ insert })) } as unknown as Parameters<typeof recordTjaiEvent>[0];
    expect(() => recordTjaiEvent(client, { event: "safety_guard_triggered", riskLevel: "critical" })).not.toThrow();
    expect(client.from).toHaveBeenCalledWith("tjai_events");
    expect(insert).toHaveBeenCalledOnce();
  });
});
