// Stripe tells us here when a subscription starts, renews, changes or ends.
// This is the only place memberships are written.
import type Stripe from 'stripe';
import { PLANS, admin, isPlan, json, stripe } from './_lib.js';

export async function POST(req: Request) {
  const s = stripe();
  let event: Stripe.Event;
  try {
    event = await s.webhooks.constructEventAsync(await req.text(), req.headers.get('stripe-signature') ?? '', process.env.STRIPE_WEBHOOK_SECRET ?? '');
  } catch {
    return json({ error: 'Bad signature' }, 400);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.subscription) await save(await s.subscriptions.retrieve(String(session.subscription)));
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await save(event.data.object);
      break;
  }
  return json({ received: true });
}

async function save(sub: Stripe.Subscription) {
  const owner = sub.metadata.user_id;
  // The price's lookup key (flight_family_yearly) wins, so plan switches in the billing page count.
  const plan = sub.items.data[0]?.price.lookup_key?.match(/^flight_([a-z]+)_/)?.[1] ?? sub.metadata.plan;
  if (!owner || !isPlan(plan)) return; // not a Flight Club subscription
  const ended = sub.status === 'canceled' || sub.status === 'incomplete_expired';
  // Newer Stripe API versions keep the period end on the item; older webhook payloads keep it on the subscription.
  const periodEnd = sub.items.data[0]?.current_period_end ?? (sub as unknown as { current_period_end?: number }).current_period_end;
  const until = ended ? (sub.ended_at ?? Math.floor(Date.now() / 1000)) : periodEnd;
  if (!until) throw new Error(`Subscription ${sub.id} has no period end`);
  const { error } = await admin()
    .from('subscriptions')
    .upsert(
      { id: sub.id, owner_id: owner, plan, seats: PLANS[plan].seats, status: sub.status, active_until: new Date(until * 1000).toISOString(), updated_at: new Date().toISOString() },
      { onConflict: 'id' },
    );
  // 23503: the owner deleted their account (which cancels the plan), so there is nothing left to update.
  if (error && error.code !== '23503') throw error;
}
