const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const object = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));

export type TjaiReceipt = { orderId: string; intakeId: string; status: 'pending' | 'paid' | 'test_paid' | 'refunded' | 'review'; testMode: boolean; expiresAt: string | null };
export type CheckoutIssue = 'unavailable' | 'mismatch' | null;
export type TjaiCheckoutState = {
  intakeId: string; orderId: string | null; ready: boolean; hasAccess: boolean;
  available: boolean; testMode: boolean; receipt: TjaiReceipt | null; issue: CheckoutIssue;
};

export function emptyTjaiCheckout(intakeId: string, orderId: string | null): TjaiCheckoutState {
  return { intakeId, orderId, ready: false, hasAccess: false, available: false, testMode: false, receipt: null, issue: null };
}

export class CheckoutRecoveryError extends Error {
  constructor(public issue: Exclude<CheckoutIssue, null>) { super(issue); }
}

/** A return URL is only a reference. The authenticated server owns the receipt. */
export function parseTjaiReceipt(value: unknown, intakeId: string, orderId: string): TjaiReceipt {
  if (!uuid.test(intakeId) || !uuid.test(orderId) || !object(value) || value.productKind !== 'tjai_pass'
    || value.programSlug !== 'tjai-pass' || value.intakeId !== intakeId || typeof value.testMode !== 'boolean'
    || !['pending', 'paid', 'test_paid', 'refunded', 'review'].includes(String(value.status))
    || (value.status === 'paid' && value.testMode) || (value.status === 'test_paid' && !value.testMode)
    || typeof value.expiresAt !== 'string' || !Number.isFinite(Date.parse(value.expiresAt))) {
    throw new CheckoutRecoveryError('mismatch');
  }
  return { orderId, intakeId, status: value.status as TjaiReceipt['status'], testMode: value.testMode, expiresAt: value.expiresAt };
}

async function readJson(url: string, fetcher: typeof fetch): Promise<unknown> {
  const response = await fetcher(url, { credentials: 'include', cache: 'no-store' });
  if (!response.ok) throw new CheckoutRecoveryError('unavailable');
  return response.json();
}

/** Successful receipt data can still be displayed when another dependency fails. */
export async function loadTjaiCheckout(intakeId: string, orderId: string | null, fetcher: typeof fetch = fetch): Promise<TjaiCheckoutState> {
  const next = emptyTjaiCheckout(intakeId, orderId);
  if (!uuid.test(intakeId) || (orderId !== null && !uuid.test(orderId))) return { ...next, issue: 'mismatch' };
  const results = await Promise.allSettled([
    readJson('/api/tjai/intake?id=' + encodeURIComponent(intakeId), fetcher).then(value => {
      if (!object(value) || !object(value.intake) || value.intake.id !== intakeId) throw new CheckoutRecoveryError('mismatch');
      next.ready = true;
    }),
    readJson('/api/tjai/access', fetcher).then(value => {
      if (!object(value) || value.available !== true || typeof value.hasPass !== 'boolean' || typeof value.hasLegacyAccess !== 'boolean') throw new CheckoutRecoveryError('unavailable');
      next.hasAccess = value.hasPass || value.hasLegacyAccess;
    }),
    readJson('/api/checkout/availability', fetcher).then(value => {
      if (!object(value) || typeof value.available !== 'boolean' || typeof value.testMode !== 'boolean' || !Array.isArray(value.programSlugs)) throw new CheckoutRecoveryError('unavailable');
      next.available = value.available && value.programSlugs.includes('tjai-pass');
      next.testMode = value.testMode;
    }),
    orderId ? readJson('/api/checkout/order-status?orderId=' + encodeURIComponent(orderId), fetcher).then(value => {
      next.receipt = parseTjaiReceipt(value, intakeId, orderId);
    }) : Promise.resolve()
  ]);
  for (const result of results) if (result.status === 'rejected') {
    if (result.reason instanceof CheckoutRecoveryError && result.reason.issue === 'mismatch') next.issue = 'mismatch';
    else if (!next.issue) next.issue = 'unavailable';
  }
  return next;
}

/** Preserve known confirmation on an outage, but never carry it to another URL. */
export function mergeTjaiCheckout(previous: TjaiCheckoutState, next: TjaiCheckoutState): TjaiCheckoutState {
  const same = previous.intakeId === next.intakeId && previous.orderId === next.orderId;
  return same && next.issue === 'unavailable' && !next.receipt ? { ...next, receipt: previous.receipt } : next;
}

export function isTjaiReceiptExpired(receipt: TjaiReceipt | null, now = Date.now()) {
  return receipt?.status === 'pending' && receipt.expiresAt !== null && Date.parse(receipt.expiresAt) <= now;
}

export function tjaiCheckoutActions(state: TjaiCheckoutState, busy: boolean, now = Date.now()) {
  const checked = state.ready && !state.issue && !busy;
  const purchase = checked && state.available && !state.hasAccess;
  return {
    canGenerate: checked && state.hasAccess,
    canBuy: purchase && !state.orderId,
    canResume: purchase && state.receipt?.status === 'pending' && !isTjaiReceiptExpired(state.receipt, now) && state.receipt.testMode === state.testMode,
    canStartNew: purchase && (state.receipt?.status === 'test_paid' || state.receipt?.status === 'refunded' || isTjaiReceiptExpired(state.receipt, now))
  };
}

/** A create acknowledgement is retained before preparing or opening checkout. */
export function parseCreatedTjaiOrder(value: unknown, intakeId: string, expectedTestMode: boolean): TjaiReceipt {
  if (!object(value) || !object(value.order) || !object(value.clientFlow)
    || typeof value.order.id !== 'string' || !uuid.test(value.order.id)
    || value.order.program_slug !== 'tjai-pass' || value.order.currency !== 'USD' || value.order.amount_minor !== 1999
    || value.order.test_mode !== expectedTestMode || value.order.status !== 'pending'
    || value.clientFlow.action !== 'redirect_lemon' || value.clientFlow.orderId !== value.order.id) throw new CheckoutRecoveryError('mismatch');
  return { intakeId, orderId: value.order.id, status: 'pending', testMode: expectedTestMode, expiresAt: null };
}

export function tjaiCheckoutPath(locale: string, intakeId: string, orderId: string | null) {
  const query = new URLSearchParams({ intake: intakeId });
  if (orderId) query.set('orderId', orderId);
  return '/' + locale + '/tjai/checkout?' + query.toString();
}
