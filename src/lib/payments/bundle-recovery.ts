const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const object = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));

export type BundleReceipt = { orderId: string; programSlug: string; status: 'pending' | 'paid' | 'test_paid' | 'refunded' | 'review'; testMode: boolean; expiresAt: string | null };
export type BundleCheckoutIssue = 'unavailable' | 'mismatch' | 'unbound' | null;
export type BundleCheckoutState = {
  programSlug: string; orderId: string | null; ready: boolean; available: boolean; testMode: boolean;
  receipt: BundleReceipt | null; issue: BundleCheckoutIssue; busy: boolean; checking: boolean; actionError: boolean;
};
export class BundleRecoveryError extends Error {
  constructor(public issue: Exclude<BundleCheckoutIssue, null> | 'unauthorized') { super(issue); }
}
export function emptyBundleCheckout(programSlug: string, orderId: string | null): BundleCheckoutState {
  return { programSlug, orderId, ready: false, available: false, testMode: false, receipt: null, issue: null, busy: false, checking: true, actionError: false };
}

/** Receipt ownership is checked by the API; product association must also match this view. */
export function parseBundleReceipt(value: unknown, programSlug: string, orderId: string): BundleReceipt {
  if (!uuid.test(orderId) || !object(value)) throw new BundleRecoveryError('mismatch');
  if (typeof value.status === 'string' && value.productKind === undefined && value.programSlug === undefined) throw new BundleRecoveryError('unbound');
  if (value.productKind !== 'bundle' || value.programSlug !== programSlug || typeof value.testMode !== 'boolean'
    || !['pending', 'paid', 'test_paid', 'refunded', 'review'].includes(String(value.status))
    || (value.status === 'paid' && value.testMode) || (value.status === 'test_paid' && !value.testMode)
    || typeof value.expiresAt !== 'string' || !Number.isFinite(Date.parse(value.expiresAt))) throw new BundleRecoveryError('mismatch');
  return { orderId, programSlug, status: value.status as BundleReceipt['status'], testMode: value.testMode, expiresAt: value.expiresAt };
}

export function parseCreatedBundleOrder(value: unknown, programSlug: string, testMode: boolean): BundleReceipt {
  if (!object(value) || !object(value.order) || !object(value.clientFlow)
    || typeof value.order.id !== 'string' || !uuid.test(value.order.id) || value.order.program_slug !== programSlug
    || value.order.currency !== 'USD' || value.order.amount_minor !== 1000 || value.order.test_mode !== testMode
    || value.order.status !== 'pending' || value.clientFlow.action !== 'redirect_lemon'
    || value.clientFlow.orderId !== value.order.id) throw new BundleRecoveryError('mismatch');
  return { orderId: value.order.id, programSlug, status: 'pending', testMode, expiresAt: null };
}

export function isBundleReceiptExpired(receipt: BundleReceipt | null, now = Date.now()) {
  return receipt?.status === 'pending' && receipt.expiresAt !== null && Date.parse(receipt.expiresAt) <= now;
}
export function bundleCheckoutActions(state: BundleCheckoutState, now = Date.now()) {
  const permitted = state.ready && state.available && !state.issue && !state.busy && !state.checking;
  const bound = state.receipt?.orderId === state.orderId && state.receipt?.programSlug === state.programSlug;
  return {
    canBuy: permitted && !state.orderId,
    canResume: permitted && bound && state.receipt?.status === 'pending' && !isBundleReceiptExpired(state.receipt, now) && state.receipt.testMode === state.testMode,
    canStartNew: permitted && bound && isBundleReceiptExpired(state.receipt, now)
  };
}
export function bundleCheckoutPath(locale: string, programSlug: string, orderId: string | null) {
  const query = new URLSearchParams({ program: programSlug });
  if (orderId) query.set('orderId', orderId);
  return '/' + locale + '/checkout?' + query.toString();
}

async function readJson(url: string, fetcher: typeof fetch) {
  const response = await fetcher(url, { credentials: 'include', cache: 'no-store' });
  if (!response.ok) throw new BundleRecoveryError('unavailable');
  return response.json() as Promise<unknown>;
}
export async function loadBundleCheckout(programSlug: string, orderId: string | null, fetcher: typeof fetch = fetch) {
  const next = emptyBundleCheckout(programSlug, orderId);
  next.checking = false;
  if (orderId !== null && !uuid.test(orderId)) return { ...next, issue: 'mismatch' as const };
  const results = await Promise.allSettled([
    readJson('/api/checkout/availability', fetcher).then(value => {
      if (!object(value) || typeof value.available !== 'boolean' || typeof value.testMode !== 'boolean' || !Array.isArray(value.programSlugs)) throw new BundleRecoveryError('unavailable');
      next.available = value.available && value.programSlugs.includes(programSlug); next.testMode = value.testMode;
    }),
    orderId ? readJson('/api/checkout/order-status?orderId=' + encodeURIComponent(orderId), fetcher).then(value => {
      next.receipt = parseBundleReceipt(value, programSlug, orderId);
    }) : Promise.resolve()
  ]);
  for (const result of results) if (result.status === 'rejected') {
    const issue = result.reason instanceof BundleRecoveryError ? result.reason.issue : 'unavailable';
    if (issue === 'mismatch' || issue === 'unbound') next.issue = issue;
    else if (!next.issue) next.issue = 'unavailable';
  }
  next.ready = !next.issue;
  return next;
}

type RecoveryDependencies = {
  fetcher?: typeof fetch; openCheckout: (url: string) => Promise<unknown>;
  rememberOrder: (orderId: string | null) => void; onUnauthorized?: () => void;
};

/** Shared by the detail CTA and return page. A synchronous busy flag prevents double clicks. */
export function createBundleCheckoutRecovery(locale: string, programSlug: string, dependencies: RecoveryDependencies) {
  const fetcher = dependencies.fetcher ?? fetch;
  let state = emptyBundleCheckout(programSlug, null), sequence = 0, initialized = false;
  const listeners = new Set<() => void>();
  const publish = (next: BundleCheckoutState) => { state = next; for (const listener of listeners) listener(); };
  const refresh = async () => {
    if (state.busy) return;
    const operation = ++sequence, id = state.orderId;
    publish({ ...state, checking: true, actionError: false });
    const result = await loadBundleCheckout(programSlug, id, fetcher);
    if (operation !== sequence) return;
    // Preserve a known confirmation during an outage, never across a binding failure.
    publish(result.issue === 'unavailable' && !result.receipt ? { ...result, receipt: state.receipt } : result);
  };
  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    initialize: (orderId: string | null) => {
      if (!initialized) { initialized = true; publish(emptyBundleCheckout(programSlug, orderId)); }
      return refresh();
    },
    refresh,
    cancel: () => { sequence++; },
    checkout: async () => {
      const actions = bundleCheckoutActions(state);
      if (!actions.canBuy && !actions.canResume) return;
      const operation = ++sequence;
      publish({ ...state, busy: true, actionError: false });
      try {
        let id = state.orderId;
        if (!id) {
          const response = await fetcher('/api/checkout/create-order', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ programSlug, locale }) });
          if (operation !== sequence) return;
          if (!response.ok) throw new BundleRecoveryError(response.status === 401 ? 'unauthorized' : 'unavailable');
          const value: unknown = await response.json();
          if (operation !== sequence) return;
          const receipt = parseCreatedBundleOrder(value, programSlug, state.testMode);
          id = receipt.orderId;
          // Persist before prepare/open, including their network and overlay failures.
          publish({ ...state, orderId: id, receipt, issue: null });
          dependencies.rememberOrder(id);
        }
        const response = await fetcher('/api/checkout/prepare-session', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: id }) });
        if (operation !== sequence) return;
        if (!response.ok) throw new BundleRecoveryError(response.status === 401 ? 'unauthorized' : 'unavailable');
        const session: unknown = await response.json();
        if (operation !== sequence) return;
        if (!object(session) || typeof session.url !== 'string' || session.testMode !== state.testMode) throw new BundleRecoveryError('mismatch');
        await dependencies.openCheckout(session.url);
      } catch (error) {
        if (operation !== sequence) return;
        publish({ ...state, actionError: true });
        if (error instanceof BundleRecoveryError && error.issue === 'unauthorized') dependencies.onUnauthorized?.();
      } finally {
        if (operation === sequence) publish({ ...state, busy: false });
      }
    },
    startNew: () => {
      if (!bundleCheckoutActions(state).canStartNew) return;
      sequence++;
      publish({ ...state, orderId: null, receipt: null, issue: null, actionError: false });
      dependencies.rememberOrder(null);
    }
  };
}
