// Opens Stripe's billing page, where the payer can change card, switch plan or cancel.
import { admin, json, stripe, userFrom } from './_lib.js';

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'Billing opens soon.' }, 503);
  const user = await userFrom(req);
  if (!user) return json({ error: 'Sign in first.' }, 401);
  const { data } = await admin().from('stripe_customers').select('customer_id').eq('user_id', user.id).maybeSingle();
  if (!data) return json({ error: 'No billing account yet.' }, 404);
  const session = await stripe().billingPortal.sessions.create({
    customer: data.customer_id,
    return_url: `${new URL(req.url).origin}/?checkout=return`,
  });
  return json({ url: session.url });
}
