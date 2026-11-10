// One-time setup for streak reminders (npm run setup:reminders). It:
//   1. makes FLIGHT's notification keys (VAPID), or reuses the ones saved in .env.local
//   2. asks for a Resend API key (hidden as you type) and, optionally, your business mailing address
//   3. saves those as secrets in Supabase, where the reminders function reads them
//   4. deploys the reminders function
//   5. writes the public notification key (and the address, if given) into the app's code
// Secrets never leave your computer except to Supabase. Run again any time to change them.
import { createECDH } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PROJECT = 'izbtudngvxquegluyums';
const ENV_FILE = '.env.local';

const readEnv = () =>
  Object.fromEntries(
    (existsSync(ENV_FILE) ? readFileSync(ENV_FILE, 'utf8') : '')
      .split('\n')
      .filter((l) => l.includes('='))
      .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
  );

function saveEnv(name, value) {
  const lines = (existsSync(ENV_FILE) ? readFileSync(ENV_FILE, 'utf8') : '').split('\n').filter((l) => l && !l.startsWith(`${name}=`));
  lines.push(`${name}=${value}`);
  writeFileSync(ENV_FILE, lines.join('\n') + '\n', { mode: 0o600 });
}

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) rl._writeToOutput = (s) => { if (s.includes(question)) rl.output.write(s); };
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

const b64url = (buf) => Buffer.from(buf).toString('base64url');
const step = (msg) => console.log(`\n✈  ${msg}`);
// --remote picks the project; --yes confirms the change (the CLI asks for both on anything hosted).
const supabase = (args, opts = {}) => spawnSync('npx', ['--yes', 'supabase@latest', ...args, `--remote=${PROJECT}`, '--yes'], { encoding: 'utf8', ...opts });

// --- 1. Notification keys: made once and kept, because changing them silences every device already signed up. ---
step('Notification keys');
let env = readEnv();
if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY || process.argv.includes('--new-keys')) {
  const ecdh = createECDH('prime256v1');
  ecdh.generateKeys();
  saveEnv('VAPID_PUBLIC_KEY', b64url(ecdh.getPublicKey()));
  saveEnv('VAPID_PRIVATE_KEY', b64url(ecdh.getPrivateKey().length === 32 ? ecdh.getPrivateKey() : Buffer.concat([Buffer.alloc(32 - ecdh.getPrivateKey().length), ecdh.getPrivateKey()])));
  console.log('  ✓ made new keys (saved in .env.local)');
} else {
  console.log('  ✓ reusing the keys in .env.local');
}
env = readEnv();

// --- 2. Resend key and mailing address ---
step('Email');
let resend = env.RESEND_API_KEY;
if (!resend || process.argv.includes('--new-resend-key')) {
  resend = await ask('Paste a Resend API key with "Sending access" (resend.com → API keys), then press Enter: ', true);
}
if (!resend.startsWith('re_')) throw new Error('That does not look like a Resend API key (it should start with re_).');
saveEnv('RESEND_API_KEY', resend);

let address = env.MAILING_ADDRESS ?? '';
const typed = await ask(`Business mailing address for the bottom of reminder emails${address ? ` [Enter keeps: ${address}]` : ' (or press Enter to leave email reminders off for now)'}: `);
if (typed) address = typed;
if (address) saveEnv('MAILING_ADDRESS', address);

// --- 3. Secrets in Supabase, via a temporary file only you can read ---
step('Saving secrets to Supabase');
const dir = mkdtempSync(join(tmpdir(), 'flight-'));
const file = join(dir, 'secrets.env');
try {
  const lines = [`RESEND_API_KEY=${resend}`, `VAPID_PUBLIC_KEY=${env.VAPID_PUBLIC_KEY}`, `VAPID_PRIVATE_KEY=${env.VAPID_PRIVATE_KEY}`];
  if (address) lines.push(`MAILING_ADDRESS="${address.replaceAll('"', '')}"`);
  writeFileSync(file, lines.join('\n') + '\n', { mode: 0o600 });
  const r = supabase(['secrets', 'set', '--env-file', file]);
  if (r.status !== 0) throw new Error(`Supabase did not accept the secrets:\n${(r.stderr || r.stdout).replaceAll(resend, '[hidden]').replaceAll(env.VAPID_PRIVATE_KEY, '[hidden]')}`);
  console.log('  ✓ saved');
} finally {
  rmSync(dir, { recursive: true, force: true });
}

// --- 4. Deploy the function ---
step('Deploying the reminders function');
// --use-api bundles on Supabase's side, so Docker isn't needed on this computer.
const d = supabase(['functions', 'deploy', 'reminders', '--no-verify-jwt', '--use-api'], { stdio: 'inherit' });
if (d.status !== 0) throw new Error('Deploy failed (see above).');

// --- 5. The app's side ---
step('Updating the app');
writeFileSync('src/lib/vapid.ts', `// The public half of FLIGHT's notification key, written by \`npm run setup:reminders\`.\n// Empty until then, which keeps the notifications switch hidden.\nexport const VAPID_PUBLIC_KEY = '${env.VAPID_PUBLIC_KEY}';\n`);
console.log('  ✓ src/lib/vapid.ts');
if (address) {
  const legal = readFileSync('src/lib/legal.ts', 'utf8').replace(/export const MAILING_ADDRESS: string \| null = .*;/, `export const MAILING_ADDRESS: string | null = ${JSON.stringify(address)};`);
  writeFileSync('src/lib/legal.ts', legal);
  console.log('  ✓ src/lib/legal.ts (mailing address)');
}

console.log(`\nDone. Tell Claude, and it will upload the app so the Reminders card appears in the Passport.${address ? '' : '\nEmail reminders stay off until you run this again with a mailing address.'}\n`);
