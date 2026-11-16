// The security policy in vercel.json allows the one inline script in index.html by its fingerprint.
// If that script changes, the fingerprint must change with it, or the app would be blocked from starting.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Security headers', () => {
  it('allow exactly the inline script in index.html', () => {
    const html = readFileSync('index.html', 'utf8');
    const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    const policy = JSON.stringify(JSON.parse(readFileSync('vercel.json', 'utf8')).headers);
    expect(scripts.length).toBeGreaterThan(0);
    for (const s of scripts) expect(policy).toContain(`'sha256-${createHash('sha256').update(s).digest('base64')}'`);
  });
});
