/**
 * Safari / older WebKit: MediaQueryList has addListener/removeListener, not addEventListener.
 * Calling mq.addEventListener throws and breaks React error boundaries that wrap the tree.
 */
export function subscribeToMediaQueryChange(mq: MediaQueryList, handler: () => void): () => void {
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }
  const legacy = mq as MediaQueryList & {
    addListener?: (cb: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
    removeListener?: (cb: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
  };
  if (typeof legacy.addListener === "function") {
    legacy.addListener(handler);
    return () => legacy.removeListener?.(handler);
  }
  return () => {};
}
