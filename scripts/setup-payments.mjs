#!/usr/bin/env node
// One-time Stripe setup for Frequent Flyers. Run from the project folder:
//   npm run setup:payments
// It asks for your Stripe secret key (test mode unless you pass --live), then:
//   1. creates the Frequent Flyers products and prices (USD with a CAD option)
//   2. creates the webhook that tells Flight when someone pays or cancels
//   3. turns on Stripe's billing page (change card, switch plan, cancel)
//   4. saves the server settings to .env.local and to Vercel (as sensitive values)
// Secrets are never printed. Safe to run again: existing items are reused.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import Stripe from 'stripe';

// Stripe's webhook stays on the Vercel address: it never moves, whatever happens to the domain.
const SITE = 'https://flight-roan-three.vercel.app';
const SUPABASE_REF = 'izbtudngvxquegluyums';
const LIVE = process.argv.includes('--live');
// Stripe Managed Payments needs a tax code on every product: a browser game sold by subscription.
const TAX_CODE = 'txcd_10201004';
const ENV_FILE = '.env.local';

const PLANS = [
  { id: 'individual', name: 'Frequent Flyers — Individual', usd: { monthly: 499, yearly: 3999 }, cad: { monthly: 649, yearly: 4999 } },
  { id: 'family', name: 'Frequent Flyers — Family (6)', usd: { monthly: 999, yearly: 6999 }, cad: { monthly: 1299, yearly: 8999 } },
  { id: 'group', name: 'Frequent Flyers — Church & groups (30)', usd: { monthly: 2499, yearly: 22999 }, cad: { monthly: 3299, yearly: 29999 } },
  { id: 'church', name: 'Frequent Flyers — Large church (100)', usd: { monthly: 5999, yearly: 54999 }, cad: { monthly: 7799, yearly: 71999 } },
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
// Live mode always asks, and keeps its secrets out of .env.local so local testing stays on test keys.
let key = LIVE ? '' : readEnv().STRIPE_SECRET_KEY;
if (!key) key = await askHidden(`Paste your Stripe ${LIVE ? 'LIVE ' : ''}secret key (Developers → API keys), then press Enter: `);
const mode = key.startsWith('sk_test_') || key.startsWith('rk_test_') ? 'test' : key.startsWith('sk_live_') || key.startsWith('rk_live_') ? 'live' : null;
if (!mode) throw new Error('That does not look like a Stripe secret key (it should start with sk_test_ or sk_live_).');
if (mode === 'live' && !LIVE) throw new Error('That is a LIVE key. Use a test key for now, or run again with --live when you are ready to take real payments.');
if (mode === 'test' && LIVE) throw new Error('That is a TEST key. For --live, paste the key that starts with sk_live_.');
const secrets = { STRIPE_SECRET_KEY: key };
const keep = (name, value) => {
  secrets[name] = value;
  if (!LIVE) saveEnv(name, value);
};
keep('STRIPE_SECRET_KEY', key);
const stripe = new Stripe(key);
console.log(`Using Stripe in ${mode.toUpperCase()} mode.`);

// --- Products and prices ---
step('Products and prices');
const portalProducts = [];
for (const plan of PLANS) {
  const keys = ['monthly', 'yearly'].map((i) => `flight_${plan.id}_${i}`);
  const { data: existing } = await stripe.prices.list({ lookup_keys: keys, active: true, expand: ['data.product', 'data.currency_options'] });
  let product = existing[0]?.product;
  if (!product) product = await stripe.products.create({ name: plan.name, tax_code: TAX_CODE, metadata: { flight_plan: plan.id } });
  else if ((product.tax_code?.id ?? product.tax_code) !== TAX_CODE) {
    await stripe.products.update(product.id, { tax_code: TAX_CODE });
    console.log(`  ✓ tax code set on ${plan.name}`);
  }
  const priceIds = [];
  for (const interval of ['monthly', 'yearly']) {
    const lookup = `flight_${plan.id}_${interval}`;
    let price = existing.find((p) => p.lookup_key === lookup);
    // A price whose amount has changed is replaced: the new one takes over the lookup key and the old
    // one is archived (current subscribers keep paying what they signed up for until they change plan).
    const stale = price && (price.unit_amount !== plan.usd[interval] || price.currency_options?.cad?.unit_amount !== plan.cad[interval]);
    if (stale) {
      await stripe.prices.update(price.id, { active: false });
      console.log(`  ✓ archived old ${lookup}`);
    }
    if (!price || stale) {
      price = await stripe.prices.create({
        product: typeof product === 'string' ? product : product.id,
        currency: 'usd',
        unit_amount: plan.usd[interval],
        currency_options: { cad: { unit_amount: plan.cad[interval] } },
        recurring: { interval: interval === 'monthly' ? 'month' : 'year' },
        lookup_key: lookup,
        transfer_lookup_key: true,
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
if (oldHook && !LIVE && readEnv().STRIPE_WEBHOOK_SECRET) {
  secrets.STRIPE_WEBHOOK_SECRET = readEnv().STRIPE_WEBHOOK_SECRET;
  console.log('  · webhook already exists');
} else {
  // A signing secret is only shown once, so replace any webhook we don't have the secret for.
  if (oldHook) await stripe.webhookEndpoints.del(oldHook.id);
  const hook = await stripe.webhookEndpoints.create({ url: hookUrl, enabled_events: events, description: 'Frequent Flyer memberships' });
  keep('STRIPE_WEBHOOK_SECRET', hook.secret);
  console.log('  ✓ webhook created');
}

// --- Billing page ---
step('Billing page');
await stripe.billingPortal.configurations.create({
  business_profile: { headline: 'Frequent Flyers' },
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
keep('SUPABASE_SERVICE_ROLE_KEY', service);
console.log(LIVE ? '  ✓ read' : '  ✓ saved to .env.local');

// --- Vercel ---
step('Vercel');
for (const name of ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'SUPABASE_SERVICE_ROLE_KEY']) toVercel(name, secrets[name]);

console.log(`\n✅ Payments are set up in ${mode.toUpperCase()} mode. Tell Claude it's done so it can redeploy and test.\n`);
