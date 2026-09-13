import { describe, expect, it } from 'vitest';
import { scrubTelemetryEvent } from '../src/lib/telemetry-privacy';

describe('telemetry privacy', () => {
  it.each(['/api/tjai/chat', '/ar/ai', '/api/nutrition', '/api/progress', '/tr/tjai', '/en/auth/callback?code=synthetic', '/ar/auth/callback', '/fr/login', '/tr/signup', '/es/verify-email', '/en/forgot-password', '/en/reset-password'])('drops private flow %s', (path) => {
    expect(scrubTelemetryEvent({ request: { url: `https://tjfit.org${path}` } })).toBeNull();
  });
  it('strips credentials, form bodies, query parameters and contextual values', () => {
    const event = scrubTelemetryEvent({
      request: { url: 'https://tjfit.org/en/store?email=private', method: 'GET', data: 'private', headers: { authorization: 'secret' }, cookies: { session: 'secret' } },
      user: { email: 'private' }, extra: { answers: 'private' }, contexts: { custom: { weight: 80 } },
      breadcrumbs: [{ message: 'private' }], exception: { values: [{ type: 'TypeError', value: 'Unexpected state' }] },
    });
    expect(event).toEqual({ request: { url: 'https://tjfit.org/en/store', method: 'GET' }, exception: { values: [{ type: 'TypeError', value: 'Unexpected state' }] } });
  });
});
