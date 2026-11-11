// Delete the signed-in traveller's account: stop any Frequent Flyers billing, remove their photo,
// then delete the user, which removes every row tied to them (profile, results, crews, plans).
import { admin, json, stripe, userFrom } from './_lib.js';

export async function POST(req: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: 'Account deletion is not available yet.' }, 503);
  const user = await userFrom(req);
  if (!user) return json({ error: 'Sign in first.' }, 401);
  const db = admin();

  try {
    // Billing first, so nobody is charged for an account that no longer exists.
    const { data: customer } = await db.from('stripe_customers').select('customer_id').eq('user_id', user.id).maybeSingle();
    // A customer left over from test mode doesn't exist in live Stripe, so there is nothing to cancel.
    const live = customer && process.env.STRIPE_SECRET_KEY ? await stripe().customers.retrieve(customer.customer_id).catch(() => null) : null;
    if (customer && live && !live.deleted) {
      const s = stripe();
      const subs = await s.subscriptions.list({ customer: customer.customer_id, status: 'all', limit: 100 });
      for (const sub of subs.data) {
        if (!['canceled', 'incomplete_expired'].includes(sub.status)) await s.subscriptions.cancel(sub.id);
      }
      await s.customers.del(customer.customer_id);
    }

    await db.storage.from('passport-photos').remove([`${user.id}/photo.jpg`]);

    const { error } = await db.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return json({ deleted: true });
  } catch (e) {
    console.error(e);
    return json({ error: 'Your account could not be deleted. Nothing was charged. Please try again.' }, 500);
  }
}
