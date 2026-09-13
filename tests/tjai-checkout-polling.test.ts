import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTjaiCheckoutMonitor, type TjaiCheckoutMonitor } from '@/lib/tjai/checkout-polling';
import { parseCreatedTjaiOrder, tjaiCheckoutActions, type TjaiCheckoutState, type TjaiReceipt } from '@/lib/tjai/checkout-recovery';

const intake = '50c75a91-4662-4975-bec1-674dd0bab343', order = '258c4040-5c04-4ec3-a66c-2a00c1b03b9c';
const otherOrder = '6deaa048-e50c-49ab-b6d8-6d3bd1345a74';
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
const receipt = (status: TjaiReceipt['status'] = 'pending') => ({
  status, testMode: status === 'test_paid', programSlug: 'tjai-pass', productKind: 'tjai_pass', intakeId: intake,
  expiresAt: '2099-09-13T00:00:00Z',
});
const monitors: TjaiCheckoutMonitor[] = [];
const settle = () => vi.advanceTimersByTimeAsync(0);
type Handler = (url: string, signal: AbortSignal) => Response | Promise<Response>;

function setup({ orderId = order as string | null, visible = true, handlers = {} as Record<string, Handler> } = {}) {
  const states: TjaiCheckoutState[] = [], checking: boolean[] = [];
  const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input), path = url.split('?')[0];
    if (handlers[path]) return handlers[path](url, init!.signal as AbortSignal);
    if (path === '/api/tjai/intake') return json({ intake: { id: intake } });
    if (path === '/api/tjai/access') return json({ available: true, hasPass: false, hasLegacyAccess: false });
    if (path === '/api/checkout/availability') return json({ available: true, testMode: false, programSlugs: ['tjai-pass'] });
    if (path === '/api/checkout/order-status') return json(receipt());
    throw new Error('Unexpected request');
  });
  const monitor = createTjaiCheckoutMonitor({ intakeId: intake, orderId, visible, fetcher,
    onState: state => states.push(state), onChecking: value => checking.push(value) });
  monitors.push(monitor);
  const count = (path: string) => fetcher.mock.calls.filter(([url]) => String(url).split('?')[0] === path).length;
  return { monitor, fetcher, states, checking, handlers, count, state: () => states.at(-1)! };
}

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-13T00:00:00Z')); });
afterEach(() => { monitors.splice(0).forEach(monitor => monitor.stop()); vi.useRealTimers(); });

describe('small owned receipt polling', () => {
  it('loads intake once and polls only the owned receipt on steady pending ticks', async () => {
    const h = setup(); h.monitor.start(); await settle();
    expect(h.fetcher).toHaveBeenCalledTimes(4);
    await vi.advanceTimersByTimeAsync(15_000);
    expect(h.count('/api/checkout/order-status')).toBe(4);
    expect(h.count('/api/tjai/intake')).toBe(1);
    expect(h.count('/api/tjai/access')).toBe(1);
    expect(h.count('/api/checkout/availability')).toBe(1);
    expect(h.state()).toMatchObject({ ready: true, issue: null, orderId: order });
    for (const [url, init] of h.fetcher.mock.calls) {
      expect(init).toMatchObject({ credentials: 'include', cache: 'no-store', signal: expect.any(AbortSignal) });
      expect(init?.method).toBeUndefined();
      if (String(url).includes('order-status')) expect(url).toBe('/api/checkout/order-status?orderId=' + order);
    }
  });

  it('does not poll before an order exists and a manual check reuses the validated intake', async () => {
    const h = setup({ orderId: null }); h.monitor.start(); await settle();
    await vi.advanceTimersByTimeAsync(60_000); expect(h.fetcher).toHaveBeenCalledTimes(3);
    h.monitor.refresh(); await settle();
    expect(h.fetcher).toHaveBeenCalledTimes(5); expect(h.count('/api/tjai/intake')).toBe(1);
    expect(h.count('/api/checkout/order-status')).toBe(0);
  });

  it('refreshes access on payment, recovers paid-awaiting-access, then stops after verified access', async () => {
    const h = setup(); h.monitor.start(); await settle();
    h.handlers['/api/checkout/order-status'] = () => json(receipt('paid'));
    await vi.advanceTimersByTimeAsync(5_000);
    expect(h.state()).toMatchObject({ receipt: { status: 'paid' }, hasAccess: false });
    expect(h.count('/api/tjai/access')).toBe(2);
    expect(tjaiCheckoutActions(h.state(), false)).toMatchObject({ canBuy: false, canGenerate: false, canResume: false });
    h.handlers['/api/tjai/access'] = () => json({ available: true, hasPass: true, hasLegacyAccess: false });
    await vi.advanceTimersByTimeAsync(15_000);
    expect(tjaiCheckoutActions(h.state(), false).canGenerate).toBe(true);
    expect(h.count('/api/tjai/access')).toBe(3);
    const calls = h.fetcher.mock.calls.length;
    await vi.advanceTimersByTimeAsync(120_000); expect(h.fetcher).toHaveBeenCalledTimes(calls);
    expect(h.count('/api/tjai/intake')).toBe(1);
    expect(h.count('/api/checkout/availability')).toBe(1);
  });

  it.each(['test_paid', 'refunded', 'review'] as const)('refreshes access on %s then requires an explicit check', async status => {
    const h = setup(); h.monitor.start(); await settle();
    h.handlers['/api/checkout/order-status'] = () => json(receipt(status));
    await vi.advanceTimersByTimeAsync(5_000);
    expect(h.count('/api/tjai/access')).toBe(2);
    expect(h.state().receipt?.status).toBe(status);
    const calls = h.fetcher.mock.calls.length;
    await vi.advanceTimersByTimeAsync(120_000); expect(h.fetcher).toHaveBeenCalledTimes(calls);
    h.monitor.setVisible(false); h.monitor.setVisible(true); await settle();
    expect(h.fetcher).toHaveBeenCalledTimes(calls);
    h.monitor.refresh(); await settle(); expect(h.fetcher).toHaveBeenCalledTimes(calls + 3);
    expect(h.count('/api/tjai/intake')).toBe(1);
    expect(tjaiCheckoutActions(h.state(), false).canGenerate).toBe(false);
  });

  it('expires pending receipts locally without another request or a repeated purchase', async () => {
    const h = setup({ handlers: { '/api/checkout/order-status': () => json({ ...receipt(), expiresAt: '2026-09-13T00:00:03Z' }) } });
    h.monitor.start(); await settle(); const emissions = h.states.length;
    await vi.advanceTimersByTimeAsync(60_000);
    expect(h.fetcher).toHaveBeenCalledTimes(4); expect(h.states.length).toBe(emissions + 1);
    expect(tjaiCheckoutActions(h.state(), false)).toMatchObject({ canResume: false, canBuy: false, canStartNew: true });
  });

  it('updates an expiry that elapsed while hidden without waking the receipt poll', async () => {
    const h = setup({ handlers: { '/api/checkout/order-status': () => json({ ...receipt(), expiresAt: '2026-09-13T00:00:03Z' }) } });
    h.monitor.start(); await settle(); h.monitor.setVisible(false); const emissions = h.states.length;
    await vi.advanceTimersByTimeAsync(60_000); h.monitor.setVisible(true); await settle();
    expect(h.fetcher).toHaveBeenCalledTimes(4); expect(h.states).toHaveLength(emissions + 1);
    expect(tjaiCheckoutActions(h.state(), false).canResume).toBe(false);
    expect(h.checking.at(-1)).toBe(false);
  });

  it.each([404, 'wrong-intake', 'wrong-product'])('stops polling a missing or mismatched receipt: %s', async problem => {
    const h = setup({ handlers: { '/api/checkout/order-status': () => problem === 404 ? json({}, 404)
      : json({ ...receipt(), ...(problem === 'wrong-intake' ? { intakeId: otherOrder } : { productKind: 'bundle' }) }) } });
    h.monitor.start(); await settle();
    expect(h.state()).toMatchObject({ receipt: null, issue: 'mismatch' });
    await vi.advanceTimersByTimeAsync(120_000); expect(h.fetcher).toHaveBeenCalledTimes(4);
    expect(tjaiCheckoutActions(h.state(), false).canBuy).toBe(false);
  });
});

describe('outage backoff and cancellation', () => {
  it.each([402, 503, 'network'] as const)('retains the same receipt during %s, backs off to a minute, and resets after recovery', async failure => {
    const h = setup(); h.monitor.start(); await settle();
    h.handlers['/api/checkout/order-status'] = () => { if (failure === 'network') throw new TypeError('offline'); return json({}, failure); };
    await vi.advanceTimersByTimeAsync(5_000);
    expect(h.state()).toMatchObject({ receipt: { orderId: order, status: 'pending' }, issue: 'unavailable' });
    expect(tjaiCheckoutActions(h.state(), false).canResume).toBe(false);
    for (const delay of [10_000, 20_000, 40_000, 60_000, 60_000]) {
      const calls = h.count('/api/checkout/order-status');
      await vi.advanceTimersByTimeAsync(delay - 1); expect(h.count('/api/checkout/order-status')).toBe(calls);
      await vi.advanceTimersByTimeAsync(1); expect(h.count('/api/checkout/order-status')).toBe(calls + 1);
    }
    h.handlers['/api/checkout/order-status'] = () => json(receipt());
    await vi.advanceTimersByTimeAsync(60_000); expect(h.state().issue).toBeNull();
    const calls = h.count('/api/checkout/order-status');
    await vi.advanceTimersByTimeAsync(5_000); expect(h.count('/api/checkout/order-status')).toBe(calls + 1);
    expect(h.count('/api/tjai/intake')).toBe(1); expect(h.count('/api/tjai/access')).toBe(1);
  });

  it('retries a failed intake until validation succeeds, then retains only its successful check', async () => {
    const h = setup({ handlers: { '/api/tjai/intake': () => json({}, 503) } });
    h.monitor.start(); await settle(); expect(h.state().ready).toBe(false);
    h.handlers['/api/tjai/intake'] = () => json({ intake: { id: intake, answers_json: { private: 'not retained' } } });
    await vi.advanceTimersByTimeAsync(10_000); expect(h.state().ready).toBe(true);
    await vi.advanceTimersByTimeAsync(10_000); expect(h.count('/api/tjai/intake')).toBe(2);
    expect(JSON.stringify(h.states)).not.toContain('not retained');
  });

  it('makes no hidden-tab requests, aborts an active poll on hide, and resumes once visible', async () => {
    const h = setup({ visible: false }); h.monitor.start();
    await vi.advanceTimersByTimeAsync(30_000); expect(h.fetcher).not.toHaveBeenCalled();
    h.monitor.setVisible(true); await settle(); expect(h.fetcher).toHaveBeenCalledTimes(4);
    let signal: AbortSignal | undefined;
    h.handlers['/api/checkout/order-status'] = (_url, current) => new Promise((_resolve, reject) => {
      signal = current; current.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
    await vi.advanceTimersByTimeAsync(5_000); const emissions = h.states.length;
    h.monitor.setVisible(false); await settle(); expect(signal?.aborted).toBe(true);
    await vi.advanceTimersByTimeAsync(60_000); expect(h.fetcher).toHaveBeenCalledTimes(5); expect(h.states).toHaveLength(emissions);
    h.handlers['/api/checkout/order-status'] = () => json(receipt());
    h.monitor.setVisible(true); await settle(); expect(h.fetcher).toHaveBeenCalledTimes(6);
    expect(h.count('/api/tjai/intake')).toBe(1);
  });

  it('times out an unresponsive request and waits for backoff before retrying', async () => {
    const h = setup({ handlers: { '/api/checkout/order-status': (_url, signal) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    }) } });
    h.monitor.start(); await settle(); await vi.advanceTimersByTimeAsync(15_000);
    expect(h.state().issue).toBe('unavailable');
    await vi.advanceTimersByTimeAsync(9_999); expect(h.count('/api/checkout/order-status')).toBe(1);
    h.handlers['/api/checkout/order-status'] = () => json(receipt());
    await vi.advanceTimersByTimeAsync(1); expect(h.state().issue).toBeNull();
    expect(h.count('/api/tjai/intake')).toBe(1);
  });

  it('never overlaps receipt requests, even if an aborted request ignores its signal and settles late', async () => {
    const h = setup(); h.monitor.start(); await settle();
    let finish!: (value: Response) => void;
    let oldSignal: AbortSignal | undefined;
    h.handlers['/api/checkout/order-status'] = (_url, signal) => { oldSignal = signal; return new Promise(resolve => { finish = resolve; }); };
    await vi.advanceTimersByTimeAsync(5_000); const emissions = h.states.length;
    h.monitor.refresh(); h.monitor.refresh(); h.monitor.setVisible(false); h.monitor.setVisible(true);
    await vi.advanceTimersByTimeAsync(20_000); expect(h.count('/api/checkout/order-status')).toBe(2); expect(oldSignal?.aborted).toBe(true);
    h.handlers['/api/checkout/order-status'] = () => json(receipt());
    finish(json(receipt('paid'))); await settle();
    expect(h.count('/api/checkout/order-status')).toBe(3);
    expect(h.states.slice(emissions).every(state => state.receipt?.status !== 'paid')).toBe(true);
    expect(h.state().receipt?.status).toBe('pending');
    expect(h.count('/api/tjai/intake')).toBe(1);
  });

  it('aborts on disposal and suppresses late state updates and further timers', async () => {
    let finish!: (value: Response) => void, signal: AbortSignal | undefined;
    const h = setup({ handlers: { '/api/checkout/order-status': (_url, current) => {
      signal = current; return new Promise(resolve => { finish = resolve; });
    } } });
    h.monitor.start(); await settle(); h.monitor.stop(); const emissions = h.states.length;
    expect(signal?.aborted).toBe(true); finish(json(receipt('paid'))); await settle();
    await vi.advanceTimersByTimeAsync(60_000); expect(h.states).toHaveLength(emissions); expect(h.fetcher).toHaveBeenCalledTimes(4);
  });
});

describe('same-intent checkout recovery', () => {
  it('retains an acknowledged order while prepare/open is busy, then resumes its receipt without creating another intent', async () => {
    const h = setup({ orderId: null }); h.monitor.start(); await settle(); h.monitor.setBusy(true);
    const acknowledged = parseCreatedTjaiOrder({ order: { id: order, program_slug: 'tjai-pass', amount_minor: 1999, currency: 'USD', status: 'pending', test_mode: false }, clientFlow: { action: 'redirect_lemon', orderId: order } }, intake, false);
    h.monitor.setOrder(order, acknowledged); await vi.advanceTimersByTimeAsync(60_000);
    expect(h.fetcher).toHaveBeenCalledTimes(3); expect(h.state().receipt).toEqual(acknowledged);
    h.monitor.setBusy(false); await settle();
    expect(h.count('/api/checkout/order-status')).toBe(1); expect(h.count('/api/tjai/intake')).toBe(1);
    expect(tjaiCheckoutActions(h.state(), false)).toMatchObject({ canBuy: false, canResume: true });
    expect(h.fetcher.mock.calls.every(([url]) => !String(url).includes('create-order') && !String(url).includes('prepare-session'))).toBe(true);
  });

  it('never applies the previous order response after navigation changes the order reference', async () => {
    const h = setup(); h.monitor.start(); await settle();
    let finish!: (value: Response) => void;
    h.handlers['/api/checkout/order-status'] = () => new Promise(resolve => { finish = resolve; });
    await vi.advanceTimersByTimeAsync(5_000);
    h.monitor.setOrder(otherOrder); const emissions = h.states.length;
    expect(h.state()).toMatchObject({ orderId: otherOrder, receipt: null });
    h.handlers['/api/checkout/order-status'] = () => json(receipt());
    finish(json(receipt('paid'))); await settle();
    expect(h.states.slice(emissions).every(state => state.orderId === otherOrder && state.receipt?.orderId === otherOrder)).toBe(true);
    expect(h.state().receipt?.status).toBe('pending'); expect(h.count('/api/tjai/intake')).toBe(1);
    expect(h.fetcher.mock.calls.at(-1)?.[0]).toBe('/api/checkout/order-status?orderId=' + otherOrder);
  });
});
