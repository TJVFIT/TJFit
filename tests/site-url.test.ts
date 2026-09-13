import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSiteUrl } from '../src/lib/site-url';

beforeEach(() => {
  for (const key of ['NEXT_PUBLIC_SITE_URL','NETLIFY','CONTEXT','URL','DEPLOY_PRIME_URL','DEPLOY_URL','VERCEL_ENV','VERCEL_PROJECT_PRODUCTION_URL','VERCEL_URL']) vi.stubEnv(key, '');
});
afterEach(() => vi.unstubAllEnvs());

describe('deployment origins', () => {
  it('uses an explicit origin before host defaults', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL','https://tjfit.org/');
    vi.stubEnv('NETLIFY','true'); vi.stubEnv('DEPLOY_PRIME_URL','https://preview.example.net');
    expect(getSiteUrl()).toBe('https://tjfit.org');
  });
  it('uses the Netlify preview origin rather than the production domain', () => {
    vi.stubEnv('NETLIFY','true'); vi.stubEnv('CONTEXT','deploy-preview');
    vi.stubEnv('URL','https://tjfit.org'); vi.stubEnv('DEPLOY_PRIME_URL','https://deploy-preview-14--tjfit.netlify.app/');
    expect(getSiteUrl()).toBe('https://deploy-preview-14--tjfit.netlify.app');
  });
  it('uses the Netlify canonical domain for production', () => {
    vi.stubEnv('NETLIFY','true'); vi.stubEnv('CONTEXT','production'); vi.stubEnv('URL','https://tjfit.org');
    vi.stubEnv('DEPLOY_PRIME_URL','https://deploy--tjfit.netlify.app');
    expect(getSiteUrl()).toBe('https://tjfit.org');
  });
  it('retains existing Vercel installations', () => {
    vi.stubEnv('VERCEL_ENV','production'); vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL','tjfit.org');
    expect(getSiteUrl()).toBe('https://tjfit.org');
  });
});
