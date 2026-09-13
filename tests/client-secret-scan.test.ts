import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const script = path.resolve('scripts/check-client-secrets.mjs');
const prefix = path.join(tmpdir(), 'tjfit-secret-scan-');
const temporary: string[] = [];
afterEach(() => {
  for (const directory of temporary.splice(0)) {
    if (!path.resolve(directory).startsWith(path.resolve(prefix))) throw new Error('Unexpected test directory');
    rmSync(directory, { recursive: true, force: true });
  }
});

function scan(content?: string, serviceKey = 'synthetic_service_credential_for_test_only') {
  const directory = mkdtempSync(prefix);
  temporary.push(directory);
  const assets = path.join(directory, '.netlify', 'static');
  mkdirSync(assets, { recursive: true });
  if (content !== undefined) writeFileSync(path.join(assets, 'app.js'), content);
  return spawnSync(process.execPath, [script, assets], {
    cwd: directory,
    env: { NODE_ENV: 'test', PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, SUPABASE_SERVICE_ROLE_KEY: serviceKey },
    encoding: 'utf8',
  });
}

describe('deployed browser artifact credential scan', () => {
  it('checks Netlify adapter assets and detects a service-role key without printing its value', () => {
    const value = 'synthetic_service_credential_for_test_only';
    const result = scan(`window.accidentalCredential = '${value}'`);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(result.stderr).not.toContain(value);
    expect(result.stdout).not.toContain(value);
  });
  it('passes clean adapter assets', () => {
    const result = scan('window.publicTitle = "TJFit"');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('1 build files checked against 1 configured private values');
  });
  it('does not report success for an empty build directory', () => {
    const result = scan();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('unverified');
  });
});
