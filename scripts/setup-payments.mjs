#!/usr/bin/env node
// One-time Stripe setup for Flight Club. Run from the project folder:
//   npm run setup:payments
// It asks for your Stripe secret key (test mode unless you pass --live), then:
//   1. creates the Flight Club products and prices (USD with a CAD option)
//   2. creates the webhook that tells Flight when someone pays or cancels
//   3. turns on Stripe's billing page (change card, switch plan, cancel)
//   4. saves the server settings to .env.local and to Vercel (as sensitive values)
// Secrets are never printed. Safe to run again: existing items are reused.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import Stripe from 'stripe';

const SITE = 'https://flight-roan-three.vercel.app';
const SUPABASE_REF = 'izbtudngvxquegluyums';
const LIVE = process.argv.includes('--live');
const ENV_FILE = '.env.local';

const PLANS = [
  { id: 'individual', name: 'Flight Club — Individual', usd: { monthly: 399, yearly: 2999 }, cad: { monthly: 499, yearly: 3999 } },
  { id: 'family', name: 'Flight Club — Family (6)', usd: { monthly: 699, yearly: 4999 }, cad: { monthly: 899, yearly: 6499 } },
  { id: 'group', name: 'Flight Club — Church & groups (30)', usd: { monthly: 1999, yearly: 17999 }, cad: { monthly: 2699, yearly: 23999 } },
];

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

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(question)) rl.output.write(s); };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

function toVercel(name, value) {
  spawnSync('npx', ['--yes', 'vercel@latest', 'env', 'rm', name, 'production', '--yes'], { stdio: 'ignore' });
  const r = spawnSync('npx', ['--yes', 'vercel@latest', 'env', 'add', name, 'production', '--sensitive'], { input: value, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`Could not save ${name} to Vercel:\n${(r.stderr || r.stdout).replaceAll(value, '[hidden]')}`);
  console.log(`  ✓ ${name} saved to Vercel`);
}

const step = (msg) => console.log(`\n✈  ${msg}`);

// --- Stripe key ---
let key = readEnv().STRIPE_SECRET_KEY;
if (!key) key = await askHidden('Paste your Stripe secret key (Developers → API keys), then press Enter: ');
const mode = key.startsWith('sk_test_') || key.startsWith('rk_test_') ? 'test' : key.startsWith('sk_live_') || key.startsWith('rk_live_') ? 'live' : null;
if (!mode) throw new Error('That does not look like a Stripe secret key (it should start with sk_test_ or sk_live_).');
if (mode === 'live' && !LIVE) throw new Error('That is a LIVE key. Use a test key for now, or run again with --live when you are ready to take real payments.');
saveEnv('STRIPE_SECRET_KEY', key);
const stripe = new Stripe(key);
console.log(`Using Stripe in ${mode.toUpperCase()} mode.`);

// --- Products and prices ---
step('Products and prices');
const portalProducts = [];
for (const plan of PLANS) {
  const keys = ['monthly', 'yearly'].map((i) => `flight_${plan.id}_${i}`);
  const { data: existing } = await stripe.prices.list({ lookup_keys: keys, active: true, expand: ['data.product'] });
  let product = existing[0]?.product;
  if (!product) product = await stripe.products.create({ name: plan.name, metadata: { flight_plan: plan.id } });
  const priceIds = [];
  for (const interval of ['monthly', 'yearly']) {
    const lookup = `flight_${plan.id}_${interval}`;
    let price = existing.find((p) => p.lookup_key === lookup);
    if (!price) {
      price = await stripe.prices.create({
        product: typeof product === 'string' ? product : product.id,
        currency: 'usd',
        unit_amount: plan.usd[interval],
        currency_options: { cad: { unit_amount: plan.cad[interval] } },
        recurring: { interval: interval === 'monthly' ? 'month' : 'year' },
        lookup_key: lookup,
        metadata: { flight_plan: plan.id },
      });
      console.log(`  ✓ created ${lookup}`);
    } else console.log(`  · ${lookup} already exists`);
    priceIds.push(price.id);
  }
  portalProducts.push({ product: typeof product === 'string' ? product : product.id, prices: priceIds });
}

// --- Webhook ---
step('Webhook');
const hookUrl = `${SITE}/api/stripe-webhook`;
const events = ['checkout.session.completed', 'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'];
const { data: hooks } = await stripe.webhookEndpoints.list({ limit: 100 });
const oldHook = hooks.find((h) => h.url === hookUrl);
if (oldHook && readEnv().STRIPE_WEBHOOK_SECRET) {
  console.log('  · webhook already exists');
} else {
  // A signing secret is only shown once, so replace any webhook we don't have the secret for.
  if (oldHook) await stripe.webhookEndpoints.del(oldHook.id);
  const hook = await stripe.webhookEndpoints.create({ url: hookUrl, enabled_events: events, description: 'Flight Club memberships' });
  saveEnv('STRIPE_WEBHOOK_SECRET', hook.secret);
  console.log('  ✓ webhook created');
}

// --- Billing page ---
step('Billing page');
await stripe.billingPortal.configurations.create({
  business_profile: { headline: 'Flight Club' },
  default_return_url: `${SITE}/?checkout=return`,
  features: {
    customer_update: { enabled: true, allowed_updates: ['email', 'address'] },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: { enabled: true, mode: 'at_period_end' },
    subscription_update: { enabled: true, default_allowed_updates: ['price'], proration_behavior: 'create_prorations', products: portalProducts },
  },
});
console.log('  ✓ billing page configured');

// --- Supabase service key (lets the server record memberships) ---
step('Supabase server key');
const keysJson = execFileSync('npx', ['--yes', 'supabase@latest', 'projects', 'api-keys', '--project-ref', SUPABASE_REF, '-o', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
const parsed = JSON.parse(keysJson);
const service = (Array.isArray(parsed) ? parsed : parsed.keys).find((k) => k.name === 'service_role')?.api_key;
if (!service) throw new Error('Could not read the Supabase service key. Run `npx supabase login` and try again.');
saveEnv('SUPABASE_SERVICE_ROLE_KEY', service);
console.log('  ✓ saved to .env.local');

// --- Vercel ---
step('Vercel');
const env = readEnv();
for (const name of ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'SUPABASE_SERVICE_ROLE_KEY']) toVercel(name, env[name]);

console.log(`\n✅ Payments are set up in ${mode.toUpperCase()} mode. Tell Claude it's done so it can redeploy and test.\n`);
