import { afterEach, describe, expect, it, vi } from 'vitest';
import { dispatchTjaiWorker, isTjaiWorkerConfigured, isWorkerRequestAuthorized } from '../src/lib/tjai/worker-dispatch';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
const secret = 'test-only-worker-secret-that-is-long-enough';
function configured() {
  vi.stubEnv('TJAI_WORKER_ENABLED', 'true');
  vi.stubEnv('TJAI_WORKER_SECRET', secret);
  vi.stubEnv('TJAI_WORKER_ORIGIN', 'https://preview.example.net');
}
describe('durable worker dispatch boundary', () => {
  it('requires a complete origin and secret before advertising availability', () => {
    configured();
    expect(isTjaiWorkerConfigured()).toBe(true);
    for (const origin of ['', 'not a url', 'http://example.net', 'https://user:pass@example.net', 'https://example.net/path', 'https://example.net/?secret=1', 'https://example.net/#test']) {
      vi.stubEnv('TJAI_WORKER_ORIGIN', origin);
      expect(isTjaiWorkerConfigured()).toBe(false);
    }
    configured(); vi.stubEnv('TJAI_WORKER_SECRET', 'a'.repeat(513));
    expect(isTjaiWorkerConfigured()).toBe(false);
  });
  it('rejects absent, short and forged secrets', () => {
    vi.stubEnv('TJAI_WORKER_SECRET', 'short');
    expect(isWorkerRequestAuthorized(new Request('https://example.net', { headers: { authorization: 'Bearer short' } }))).toBe(false);
    configured();
    expect(isWorkerRequestAuthorized(new Request('https://example.net'))).toBe(false);
    expect(isWorkerRequestAuthorized(new Request('https://example.net', { headers: { authorization: 'Bearer forged' } }))).toBe(false);
    expect(isWorkerRequestAuthorized(new Request('https://example.net', { headers: { authorization: `Bearer ${secret}` } }))).toBe(true);
  });
  it('does not invoke workers while disabled', async () => {
    configured(); vi.stubEnv('TJAI_WORKER_ENABLED', 'false');
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    expect(await dispatchTjaiWorker()).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('only sends the secret to the configured HTTPS origin without redirects', async () => {
    configured();
    const fetcher = vi.fn().mockResolvedValue({ status: 202 }); vi.stubGlobal('fetch', fetcher);
    expect(await dispatchTjaiWorker()).toBe(true);
    expect(String(fetcher.mock.calls[0][0])).toBe('https://preview.example.net/.netlify/functions/tjai-worker-background');
    expect(fetcher.mock.calls[0][1]).toMatchObject({ method: 'POST', redirect: 'error', headers: { authorization: `Bearer ${secret}` } });
    vi.stubEnv('TJAI_WORKER_ORIGIN', 'http://preview.example.net');
    expect(await dispatchTjaiWorker()).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('leaves recovery to the scheduler after network failure', async () => {
    configured(); vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));
    expect(await dispatchTjaiWorker()).toBe(false);
  });
});
