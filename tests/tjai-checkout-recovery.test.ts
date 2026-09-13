import { describe, expect, it, vi } from 'vitest';
import { emptyTjaiCheckout, loadTjaiCheckout, mergeTjaiCheckout, parseCreatedTjaiOrder, parseTjaiReceipt, tjaiCheckoutActions, tjaiCheckoutPath, type TjaiCheckoutState, type TjaiReceipt } from '@/lib/tjai/checkout-recovery';
import { getTjaiCheckoutCopy } from '@/lib/tjai/checkout-copy';

const intake = '50c75a91-4662-4975-bec1-674dd0bab343', order = '258c4040-5c04-4ec3-a66c-2a00c1b03b9c';
const otherIntake = '5ca23141-5c04-4ec3-a66c-2a00c1b03b9c', otherOrder = '6deaa048-e50c-49ab-b6d8-6d3bd1345a74';
const future = '2099-09-13T00:00:00Z';
const receiptData = (status: TjaiReceipt['status'] = 'pending', testMode = false) => ({ status, testMode, programSlug: 'tjai-pass', productKind: 'tjai_pass', intakeId: intake, expiresAt: future });
const ready = (status?: TjaiReceipt['status'], testMode = false): TjaiCheckoutState => ({
  ...emptyTjaiCheckout(intake, status ? order : null), ready: true, available: true, testMode,
  receipt: status ? parseTjaiReceipt(receiptData(status, testMode), intake, order) : null
});
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
function network(overrides: Record<string, () => Response | Promise<Response>> = {}) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const path = String(input).split('?')[0];
    if (overrides[path]) return overrides[path]();
    if (path === '/api/tjai/intake') return json({ intake: { id: intake } });
    if (path === '/api/tjai/access') return json({ available: true, hasPass: false, hasLegacyAccess: false });
    if (path === '/api/checkout/availability') return json({ available: true, testMode: false, programSlugs: ['tjai-pass'] });
    if (path === '/api/checkout/order-status') return json(receiptData());
    throw new Error('Unexpected request');
  });
}

describe('TJAI receipt binding and safe actions', () => {
  it.each(['pending', 'paid', 'refunded', 'review'] as const)('accepts the owned matching %s live receipt', status => {
    expect(parseTjaiReceipt(receiptData(status), intake, order)).toMatchObject({ intakeId: intake, orderId: order, status, testMode: false });
  });
  it.each([
    { productKind: 'bundle' }, { programSlug: 'home-starter' }, { intakeId: otherIntake }, { intakeId: null },
    { testMode: 'false' }, { status: 'success' }, { status: 'paid', testMode: true }, { status: 'test_paid', testMode: false },
    { expiresAt: null }, { expiresAt: 'invalid' }
  ])('rejects the mismatched or malformed receipt %j', change => {
    expect(() => parseTjaiReceipt({ ...receiptData(), ...change }, intake, order)).toThrow('mismatch');
  });
  it('records a test receipt without enabling generation, another purchase, or reopening a paid checkout', () => {
    expect(tjaiCheckoutActions(ready('test_paid', true), false)).toEqual({ canGenerate: false, canBuy: false, canResume: false, canStartNew: true });
  });
  it('keeps a live paid receipt waiting for independently verified access', () => {
    expect(tjaiCheckoutActions(ready('paid'), false)).toEqual({ canGenerate: false, canBuy: false, canResume: false, canStartNew: false });
    expect(tjaiCheckoutActions({ ...ready('paid'), hasAccess: true }, false).canGenerate).toBe(true);
  });
  it('only reopens the same pending order; never starts another order automatically', () => {
    expect(tjaiCheckoutActions(ready('pending'), false)).toEqual({ canGenerate: false, canBuy: false, canResume: true, canStartNew: false });
    expect(tjaiCheckoutActions({ ...ready('pending'), testMode: true }, false).canResume).toBe(false);
  });
  it('allows an explicit restart only for a refunded/test/expired receipt, never one in review', () => {
    expect(tjaiCheckoutActions(ready('refunded'), false).canStartNew).toBe(true);
    expect(tjaiCheckoutActions(ready('review'), false).canStartNew).toBe(false);
    const expired = ready('pending'); expired.receipt!.expiresAt = '2020-01-01T00:00:00Z';
    expect(tjaiCheckoutActions(expired, false)).toMatchObject({ canResume: false, canBuy: false, canStartNew: true });
  });
  it.each([{ available: false }, { ready: false }, { issue: 'unavailable' as const }, { issue: 'mismatch' as const }])('keeps buying closed when a required check fails: %j', changes => {
    expect(tjaiCheckoutActions({ ...ready(), ...changes }, false).canBuy).toBe(false);
    expect(tjaiCheckoutActions({ ...ready('pending'), ...changes }, false).canResume).toBe(false);
  });
  it('preserves separate historical access even when checkout is closed or a different payment was refunded', () => {
    expect(tjaiCheckoutActions({ ...ready('refunded'), hasAccess: true, available: false }, false)).toEqual({ canGenerate: true, canBuy: false, canResume: false, canStartNew: false });
  });
  it('blocks double clicks while a request or status check is active', () => {
    expect(tjaiCheckoutActions(ready(), true).canBuy).toBe(false);
    expect(tjaiCheckoutActions(ready('pending'), true).canResume).toBe(false);
  });
});

describe('loading returns and retaining confirmation during service failures', () => {
  it('loads the exact returned order and owned intake using private uncached requests', async () => {
    const fetcher = network(), state = await loadTjaiCheckout(intake, order, fetcher);
    expect(state).toMatchObject({ intakeId: intake, orderId: order, ready: true, issue: null, receipt: { status: 'pending' } });
    expect(fetcher).toHaveBeenCalledWith('/api/checkout/order-status?orderId=' + order, { credentials: 'include', cache: 'no-store' });
  });
  it('does not invent pending-payment state before any order exists', async () => {
    const fetcher = network(), state = await loadTjaiCheckout(intake, null, fetcher);
    expect(state.receipt).toBeNull(); expect(tjaiCheckoutActions(state, false).canBuy).toBe(true);
    expect(fetcher.mock.calls.some(([path]) => String(path).includes('order-status'))).toBe(false);
  });
  it.each([401, 402, 503])('retains a known test confirmation on HTTP %s and disables new actions', async status => {
    const previous = ready('test_paid', true);
    const next = await loadTjaiCheckout(intake, order, network({ '/api/checkout/order-status': () => json({}, status) }));
    const state = mergeTjaiCheckout(previous, next);
    expect(state.receipt).toBe(previous.receipt); expect(state.issue).toBe('unavailable');
    expect(tjaiCheckoutActions(state, false)).toEqual({ canGenerate: false, canBuy: false, canResume: false, canStartNew: false });
  });
  it('retains the reference on a network outage, and preserves a successful receipt if access is unavailable', async () => {
    const previous = ready('pending');
    const failed = await loadTjaiCheckout(intake, order, vi.fn().mockRejectedValue(new TypeError('offline')));
    expect(mergeTjaiCheckout(previous, failed).receipt).toBe(previous.receipt);
    const partial = await loadTjaiCheckout(intake, order, network({
      '/api/tjai/access': () => json({}, 503), '/api/checkout/order-status': () => json(receiptData('test_paid', true))
    }));
    expect(partial.receipt?.status).toBe('test_paid'); expect(partial.hasAccess).toBe(false); expect(partial.issue).toBe('unavailable');
  });
  it('never carries old confirmation to another intake/order or hides a binding mismatch', () => {
    const previous = ready('paid');
    expect(mergeTjaiCheckout(previous, { ...emptyTjaiCheckout(otherIntake, order), issue: 'unavailable' }).receipt).toBeNull();
    expect(mergeTjaiCheckout(previous, { ...emptyTjaiCheckout(intake, otherOrder), issue: 'unavailable' }).receipt).toBeNull();
    expect(mergeTjaiCheckout(previous, { ...emptyTjaiCheckout(intake, order), issue: 'mismatch' }).receipt).toBeNull();
  });
  it('rejects a wrong-product response and malformed URL before allowing checkout', async () => {
    const state = await loadTjaiCheckout(intake, order, network({ '/api/checkout/order-status': () => json({ ...receiptData(), productKind: 'bundle' }) }));
    expect(state.issue).toBe('mismatch'); expect(state.receipt).toBeNull();
    const fetcher = network(); expect((await loadTjaiCheckout(intake, 'invalid', fetcher)).issue).toBe('mismatch'); expect(fetcher).not.toHaveBeenCalled();
  });
  it('does not infer access or purchase availability from malformed success data', async () => {
    const state = await loadTjaiCheckout(intake, null, network({ '/api/tjai/access': () => json({ hasPass: 'true' }), '/api/checkout/availability': () => json({ available: true }) }));
    expect(state.issue).toBe('unavailable'); expect(state.hasAccess).toBe(false); expect(tjaiCheckoutActions(state, false).canBuy).toBe(false);
  });
});

describe('prepared checkout recovery and localized receipt copy', () => {
  const created = { order: { id: order, program_slug: 'tjai-pass', amount_minor: 1999, currency: 'USD', status: 'pending', test_mode: true }, clientFlow: { action: 'redirect_lemon', orderId: order } };
  it('retains the same acknowledged order in the return URL before a failed prepare can be retried', () => {
    const receipt = parseCreatedTjaiOrder(created, intake, true);
    const path = tjaiCheckoutPath('ar', intake, receipt.orderId), restored = new URL('https://example.test' + path);
    expect(restored.searchParams.get('orderId')).toBe(order); expect(restored.searchParams.get('intake')).toBe(intake);
    const state = { ...ready(), testMode: true, orderId: receipt.orderId, receipt };
    expect(tjaiCheckoutActions(state, false)).toMatchObject({ canBuy: false, canResume: true });
  });
  it.each([{ order: { ...created.order, amount_minor: 1 } }, { order: { ...created.order, test_mode: false } }, { clientFlow: { ...created.clientFlow, orderId: otherOrder } }])('rejects an inconsistent create acknowledgement %j', change => {
    expect(() => parseCreatedTjaiOrder({ ...created, ...change }, intake, true)).toThrow('mismatch');
  });
  it('has complete distinct receipt/retry copy in all five locales', () => {
    const english = getTjaiCheckoutCopy('en');
    for (const locale of ['en', 'tr', 'ar', 'es', 'fr'] as const) {
      const copy = getTjaiCheckoutCopy(locale);
      expect(Object.keys(copy).sort()).toEqual(Object.keys(english).sort());
      expect(Object.values(copy).every(value => typeof value === 'string' && value.trim().length > 0)).toBe(true);
      if (locale !== 'en') expect(copy.testPaid).not.toBe(english.testPaid);
    }
  });
});
