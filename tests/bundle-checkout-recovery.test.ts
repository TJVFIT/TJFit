import { describe, expect, it, vi } from 'vitest';
import { bundleCheckoutActions, bundleCheckoutPath, createBundleCheckoutRecovery, loadBundleCheckout, parseBundleReceipt, parseCreatedBundleOrder } from '@/lib/payments/bundle-recovery';
import { getDigitalCheckoutCopy } from '@/lib/payments/checkout-copy';

const slug = 'home-starter', otherSlug = 'strength-builder';
const order = '258c4040-5c04-4ec3-a66c-2a00c1b03b9c';
const future = '2099-09-13T00:00:00Z';
const receipt = (changes: Record<string, unknown> = {}) => ({ status: 'pending', testMode: true, programSlug: slug, productKind: 'bundle', expiresAt: future, ...changes });
const created = () => ({ order: { id: order, program_slug: slug, amount_minor: 1000, currency: 'USD', status: 'pending', test_mode: true }, clientFlow: { action: 'redirect_lemon', orderId: order } });
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
type Handler = (init?: RequestInit) => Response | Promise<Response>;
function network(overrides: Record<string, Handler> = {}) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const path = String(input).split('?')[0];
    if (overrides[path]) return overrides[path](init);
    if (path === '/api/checkout/availability') return json({ available: true, testMode: true, programSlugs: [slug, otherSlug] });
    if (path === '/api/checkout/order-status') return json(receipt());
    if (path === '/api/checkout/create-order') return json(created());
    if (path === '/api/checkout/prepare-session') return json({ url: 'https://tjfit.lemonsqueezy.com/checkout/test', testMode: true });
    throw new Error('Unexpected request');
  });
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(res => { resolve = res; });
  return { promise, resolve };
}
function setup(fetcher = network(), openCheckout = vi.fn().mockResolvedValue('overlay')) {
  const rememberOrder = vi.fn(), onUnauthorized = vi.fn();
  const recovery = createBundleCheckoutRecovery('tr', slug, { fetcher, openCheckout, rememberOrder, onUnauthorized });
  return { recovery, fetcher, openCheckout, rememberOrder, onUnauthorized };
}
const noActions = { canBuy: false, canResume: false, canStartNew: false };

describe('bundle receipt binding and localized status', () => {
  it.each([
    { programSlug: otherSlug }, { productKind: 'tjai_pass' }, { programSlug: 'tjai-pass', productKind: 'tjai_pass' },
    { status: 'paid', testMode: true }, { status: 'test_paid', testMode: false }, { testMode: 'true' },
    { status: 'success' }, { expiresAt: null }, { expiresAt: 'invalid' }
  ])('rejects mismatched or malformed receipt %j', changes => {
    expect(() => parseBundleReceipt(receipt(changes), slug, order)).toThrow('mismatch');
  });
  it('gives historical status-only receipts a neutral unbound result, never bundle confirmation', async () => {
    const state = await loadBundleCheckout(slug, order, network({ '/api/checkout/order-status': () => json({ status: 'paid' }) }));
    expect(state).toMatchObject({ issue: 'unbound', receipt: null, orderId: order });
    expect(bundleCheckoutActions(state)).toEqual(noActions);
  });
  it.each(['paid', 'refunded', 'review', 'test_paid'])('blocks fresh purchase or resume for a known %s receipt', async status => {
    const state = await loadBundleCheckout(slug, order, network({ '/api/checkout/order-status': () => json(receipt({ status, testMode: status !== 'paid' })) }));
    expect(state.receipt?.status).toBe(status);
    expect(bundleCheckoutActions(state)).toEqual(noActions);
  });
  it('rejects an invalid reference without requests and never trusts a mismatched paid receipt', async () => {
    const fetcher = network();
    expect((await loadBundleCheckout(slug, 'invalid', fetcher)).issue).toBe('mismatch');
    expect(fetcher).not.toHaveBeenCalled();
    const state = await loadBundleCheckout(otherSlug, order, network({ '/api/checkout/order-status': () => json(receipt({ status: 'paid', testMode: false })) }));
    expect(state.receipt).toBeNull(); expect(state.issue).toBe('mismatch');
  });
  it('rejects inconsistent create acknowledgements', () => {
    const value = created();
    expect(() => parseCreatedBundleOrder(value, otherSlug, true)).toThrow('mismatch');
    expect(() => parseCreatedBundleOrder(value, slug, false)).toThrow('mismatch');
    expect(() => parseCreatedBundleOrder({ ...value, order: { ...value.order, amount_minor: 1 } }, slug, true)).toThrow('mismatch');
  });
  it('contains complete distinct recovery copy for five locales', () => {
    const english = getDigitalCheckoutCopy('en');
    for (const locale of ['en', 'tr', 'ar', 'es', 'fr'] as const) {
      const copy = getDigitalCheckoutCopy(locale);
      expect(Object.keys(copy).sort()).toEqual(Object.keys(english).sort());
      for (const key of ['checking', 'resume', 'expired', 'startNew', 'mismatch', 'unbound'] as const) {
        expect(copy[key].trim().length).toBeGreaterThan(0);
        if (locale !== 'en') expect(copy[key]).not.toBe(english[key]);
      }
    }
  });
});

describe('shared bundle checkout recovery operations', () => {
  it('reopens a returned pending checkout without creating any new order', async () => {
    const { recovery, fetcher, openCheckout } = setup();
    await recovery.initialize(order); await recovery.checkout(); await recovery.checkout();
    expect(fetcher.mock.calls.filter(([url]) => String(url).endsWith('create-order'))).toHaveLength(0);
    const prepares = fetcher.mock.calls.filter(([url]) => String(url).endsWith('prepare-session'));
    expect(prepares).toHaveLength(2);
    for (const [, init] of prepares) expect(JSON.parse(String(init?.body))).toEqual({ orderId: order });
    expect(openCheckout).toHaveBeenCalledTimes(2);
  });
  it.each(['prepare', 'open'])('persists the reference before %s failure and reuses it on retry', async failure => {
    let attempts = 0;
    const fetcher = network({ '/api/checkout/prepare-session': () => {
      expect(rememberOrder).toHaveBeenCalledWith(order);
      if (failure === 'prepare' && attempts++ === 0) return json({}, 503);
      return json({ url: 'https://tjfit.lemonsqueezy.com/checkout/test', testMode: true });
    } });
    const opener = vi.fn().mockImplementation(async () => {
      expect(rememberOrder).toHaveBeenCalledWith(order);
      if (failure === 'open' && attempts++ === 0) throw new Error('overlay unavailable');
    });
    const { recovery, rememberOrder } = setup(fetcher, opener);
    await recovery.initialize(null); await recovery.checkout();
    expect(recovery.getSnapshot()).toMatchObject({ orderId: order, actionError: true });
    await recovery.checkout();
    expect(fetcher.mock.calls.filter(([url]) => String(url).endsWith('create-order'))).toHaveLength(1);
    expect(fetcher.mock.calls.filter(([url]) => String(url).endsWith('prepare-session')).map(([, init]) => JSON.parse(String(init?.body)))).toEqual([{ orderId: order }, { orderId: order }]);
    const restored = new URL('https://example.test' + bundleCheckoutPath('tr', slug, order));
    expect(restored.searchParams.get('orderId')).toBe(order); expect(restored.searchParams.get('program')).toBe(slug);
  });
  it('ignores simultaneous purchase clicks before a create response arrives', async () => {
    const waiting = deferred<Response>();
    const { recovery, fetcher } = setup(network({ '/api/checkout/create-order': () => waiting.promise }));
    await recovery.initialize(null);
    const first = recovery.checkout(), second = recovery.checkout();
    expect(fetcher.mock.calls.filter(([url]) => String(url).endsWith('create-order'))).toHaveLength(1);
    waiting.resolve(json(created())); await Promise.all([first, second]);
  });
  it('requires a deliberate reset for an expired receipt before creating a new order', async () => {
    const { recovery, fetcher, rememberOrder } = setup(network({ '/api/checkout/order-status': () => json(receipt({ expiresAt: '2020-01-01T00:00:00Z' })) }));
    await recovery.initialize(order); await recovery.checkout();
    expect(bundleCheckoutActions(recovery.getSnapshot())).toEqual({ canBuy: false, canResume: false, canStartNew: true });
    expect(fetcher.mock.calls.some(([url]) => String(url).endsWith('create-order'))).toBe(false);
    recovery.startNew(); expect(rememberOrder).toHaveBeenCalledWith(null);
    await recovery.checkout();
    expect(fetcher.mock.calls.filter(([url]) => String(url).endsWith('create-order'))).toHaveLength(1);
  });
  it.each([401, 402, 503])('keeps the known reference and all purchase actions closed on status HTTP %s', async status => {
    const { recovery, fetcher } = setup(network({ '/api/checkout/order-status': () => json({}, status) }));
    await recovery.initialize(order); await recovery.checkout(); recovery.startNew();
    expect(recovery.getSnapshot()).toMatchObject({ orderId: order, issue: 'unavailable' });
    expect(bundleCheckoutActions(recovery.getSnapshot())).toEqual(noActions);
    expect(fetcher.mock.calls.some(([url]) => String(url).endsWith('create-order'))).toBe(false);
  });
  it('preserves known confirmation on a later outage without allowing a second purchase', async () => {
    let fail = false;
    const { recovery } = setup(network({ '/api/checkout/order-status': () => fail ? Promise.reject(new TypeError('offline')) : json(receipt({ status: 'test_paid' })) }));
    await recovery.initialize(order); fail = true; await recovery.refresh();
    expect(recovery.getSnapshot()).toMatchObject({ issue: 'unavailable', receipt: { status: 'test_paid' } });
    expect(bundleCheckoutActions(recovery.getSnapshot())).toEqual(noActions);
  });
  it('blocks actions while status is checking and discards its late result after selecting another product', async () => {
    const waiting = deferred<Response>();
    const first = setup(network({ '/api/checkout/order-status': () => waiting.promise }));
    const checking = first.recovery.initialize(order);
    expect(bundleCheckoutActions(first.recovery.getSnapshot())).toEqual(noActions);
    first.recovery.cancel();
    const second = createBundleCheckoutRecovery('tr', otherSlug, { fetcher: network(), openCheckout: vi.fn(), rememberOrder: vi.fn() });
    await second.initialize(null);
    waiting.resolve(json(receipt({ status: 'paid', testMode: false }))); await checking;
    expect(first.recovery.getSnapshot().receipt).toBeNull();
    expect(second.getSnapshot()).toMatchObject({ programSlug: otherSlug, orderId: null, receipt: null });
    expect(bundleCheckoutActions(second.getSnapshot()).canBuy).toBe(true);
  });
  it('does not let an older refresh overwrite a newer refund', async () => {
    const waiting = deferred<Response>(); let count = 0;
    const { recovery } = setup(network({ '/api/checkout/order-status': () => ++count === 1 ? waiting.promise : json(receipt({ status: 'refunded' })) }));
    const first = recovery.initialize(order); await recovery.refresh();
    waiting.resolve(json(receipt({ status: 'paid', testMode: false }))); await first;
    expect(recovery.getSnapshot().receipt?.status).toBe('refunded');
  });
  it('does not open a session from the wrong environment and preserves its reference', async () => {
    const { recovery, openCheckout } = setup(network({ '/api/checkout/prepare-session': () => json({ url: 'https://tjfit.lemonsqueezy.com/checkout/test', testMode: false }) }));
    await recovery.initialize(null); await recovery.checkout();
    expect(recovery.getSnapshot()).toMatchObject({ orderId: order, actionError: true });
    expect(openCheckout).not.toHaveBeenCalled();
  });
  it('keeps normal login recovery for an anonymous create without logging provider errors', async () => {
    const { recovery, onUnauthorized, openCheckout } = setup(network({ '/api/checkout/create-order': () => json({}, 401) }));
    await recovery.initialize(null); await recovery.checkout();
    expect(onUnauthorized).toHaveBeenCalledOnce(); expect(openCheckout).not.toHaveBeenCalled();
  });
});
