// Starts a Stripe Checkout for a Flight Club plan and returns the page to send the traveller to.
import { customerFor, isPlan, json, lookupKey, stripe, userFrom, type Plan } from './_lib.js';

export async function POST(req: Request) {
  // Until the Stripe keys are added, the plans show but can't be bought yet.
  if (!process.env.STRIPE_SECRET_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: 'Flight Club opens soon — payments are still being set up.' }, 503);
  }
  const user = await userFrom(req);
  if (!user) return json({ error: 'Sign in first.' }, 401);

  const { plan, interval } = (await req.json().catch(() => ({}))) as { plan?: unknown; interval?: unknown };
  if (!isPlan(plan) || (interval !== 'monthly' && interval !== 'yearly')) return json({ error: 'Unknown plan.' }, 400);

  try {
    return json({ url: await startSession(req, user, plan, interval) });
  } catch (e) {
    console.error(e);
    return json({ error: 'Checkout could not open. Try again in a moment.' }, 502);
  }
}

async function startSession(req: Request, user: { id: string; email?: string }, plan: Plan, interval: 'monthly' | 'yearly') {
  const s = stripe();
  const { data: prices } = await s.prices.list({ lookup_keys: [lookupKey(plan, interval)], active: true });
  if (!prices[0]) throw new Error(`No active price for ${lookupKey(plan, interval)}`);

  const origin = new URL(req.url).origin;
  const session = await s.checkout.sessions.create({
    mode: 'subscription',
    customer: await customerFor(user),
    line_items: [{ price: prices[0].id, quantity: 1 }],
    client_reference_id: user.id,
    subscription_data: { metadata: { user_id: user.id, plan } },
    allow_promotion_codes: true,
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancel`,
  });
  return session.url;
}
