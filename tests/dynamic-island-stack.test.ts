/**
 * Pins the island's queue math (DESIGN-09 follow-up: the stacked-queue
 * rework was trace-verified only; this makes the suite the guard).
 */

import { describe, it, expect } from "vitest";

import { computeIslandStack } from "@/components/ui/dynamic-island-stack";

const item = (id: number) => ({ id, type: "achievement", message: `m${id}` });

describe("computeIslandStack", () => {
  it("empty queue renders nothing", () => {
    const { visible, overflow } = computeIslandStack([]);
    expect(visible).toEqual([]);
    expect(overflow).toBe(0);
  });

  it("fire 3 → see all 3, newest first, no overflow", () => {
    const q = [item(1), item(2), item(3)];
    const { visible, overflow } = computeIslandStack(q);
    expect(visible.map((x) => x.id)).toEqual([3, 2, 1]);
    expect(overflow).toBe(0);
  });

  it("fire 5 → see newest 3, overflow badge counts the hidden 2", () => {
    const q = [1, 2, 3, 4, 5].map(item);
    const { visible, overflow } = computeIslandStack(q);
    expect(visible.map((x) => x.id)).toEqual([5, 4, 3]);
    expect(overflow).toBe(2);
  });

  it("oldest visible expires → stack recomputes stably, hidden item promotes", () => {
    const q = [1, 2, 3, 4, 5].map(item);
    // item 3's timer fires (oldest VISIBLE): queue drops it
    const after = q.filter((x) => x.id !== 3);
    const { visible, overflow } = computeIslandStack(after);
    expect(visible.map((x) => x.id)).toEqual([5, 4, 2]);
    expect(overflow).toBe(1);
  });

  it("newest expires mid-stack → order stays newest-first with no gaps", () => {
    const q = [1, 2, 3].map(item);
    const after = q.filter((x) => x.id !== 3);
    const { visible, overflow } = computeIslandStack(after);
    expect(visible.map((x) => x.id)).toEqual([2, 1]);
    expect(overflow).toBe(0);
  });

  it("does not mutate the input queue", () => {
    const q = [1, 2, 3, 4].map(item);
    const snapshot = q.map((x) => x.id);
    computeIslandStack(q);
    expect(q.map((x) => x.id)).toEqual(snapshot);
  });
});
