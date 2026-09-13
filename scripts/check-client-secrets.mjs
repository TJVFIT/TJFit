import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { parseEnv } from 'node:util';

// This check prints names/counts only. Never print secret values or matched lines.
// Netlify's Next adapter moves public assets into .netlify/static after build.
const root = path.resolve(process.argv[2] ?? '.next/static');
await stat(root);
const sensitiveName = /(?:SECRET(?:_KEY)?|API_KEY|SERVICE_ROLE(?:_KEY)?|CREDENTIALS|TOKEN)$/;
let local = {};
try { local = parseEnv(await readFile('.env.local', 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const secrets = Object.entries({ ...local, ...process.env })
  .filter(([key, value]) => !key.startsWith('NEXT_PUBLIC_') && sensitiveName.test(key) && typeof value === 'string' && value.length >= 20);

async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(file));
    else if (/\.(?:js|json|map|html|css)$/.test(entry.name)) result.push(file);
  }
  return result;
}

const candidates = await files(root);
if (!candidates.length || !secrets.length) {
  console.error('Client secret scan unverified: build files or configured private credentials are missing.');
  process.exitCode = 1;
} else {
  const matches = new Set();
  for (const file of candidates) {
    const content = await readFile(file, 'utf8');
    for (const [key, value] of secrets) if (content.includes(value)) matches.add(key);
  }
  if (matches.size) {
    console.error('Client secret scan FAILED for configuration names:', [...matches].join(', '));
    process.exitCode = 1;
  } else {
    console.log(`Client secret scan passed: ${candidates.length} build files checked against ${secrets.length} configured private values.`);
  }
}
