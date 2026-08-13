/**
 * Pure stack math for the dynamic island (extracted so it's unit-testable —
 * the closure re-audit flagged the stacked-queue rework as trace-verified
 * only, and tests can't import the .tsx component under jsx:preserve).
 *
 * Newest-first, at most 3 visible, everything older collapses into the
 * overflow count. Recomputing after any single removal (an item's timer
 * firing) yields a stable newest-first order with no gaps.
 */
export function computeIslandStack<T>(queue: readonly T[]): { visible: T[]; overflow: number } {
  const stack = queue.length > 3 ? queue.slice(queue.length - 3) : [...queue];
  const visible = [...stack].reverse();
  return { visible, overflow: queue.length - visible.length };
}
